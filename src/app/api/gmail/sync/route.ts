import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Token management ──────────────────────────────────────────────────────────
async function getValidAccessToken(userId: string): Promise<string | null> {
  // First try to refresh using stored refresh token in User table
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gmailAccessToken:  true,
      gmailRefreshToken: true,
      gmailConnected:    true,
    },
  });

  // If we have a refresh token, always refresh to get a fresh access token
  if (user?.gmailRefreshToken) {
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id:     process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: user.gmailRefreshToken,
          grant_type:    "refresh_token",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newToken = data.access_token;

        // Save fresh token
        await prisma.user.update({
          where: { id: userId },
          data: { gmailAccessToken: newToken, gmailConnected: true },
        });
        await prisma.account.updateMany({
          where: { userId, provider: "google" },
          data: {
            access_token: newToken,
            expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
          },
        });

                return newToken;
      } else {
        const errData = await res.json();
        console.error("Refresh token failed:", errData);
      }
    } catch (err) {
      console.error("Token refresh error:", err);
    }
  }

  // Fall back to stored access token
  return user?.gmailAccessToken || null;
}

// ── Gmail API helpers ─────────────────────────────────────────────────────────
async function fetchGmailMessages(accessToken: string, query: string, maxResults = 50) {
  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Gmail API error ${res.status}`);
  }

  const data = await res.json();
  return data.messages || [];
}

async function fetchMessageDetail(accessToken: string, messageId: string) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return null;
  return res.json();
}

function extractHeader(headers: { name: string; value: string }[], name: string) {
  return headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function decodeSnippet(snippet: string) {
  return snippet
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

// ── Rule-based pre-classifier (fast, no AI needed) ───────────────────────────
function ruleBasedClassify(subject: string, snippet: string): {
  detectedType: string;
  suggestedStatus: string | null;
  confidence: number;
} | null {
  const text = (subject + " " + snippet).toLowerCase();

  // REJECTION signals
  const rejectionWords = [
    "unfortunately", "not moving forward", "not selected", "not been selected",
    "other candidates", "position has been filled", "regret to inform",
    "not proceed", "unsuccessful", "not shortlisted", "not a match",
    "decided to move forward with other", "will not be moving",
  ];
  if (rejectionWords.some(w => text.includes(w))) {
    return { detectedType: "REJECTION", suggestedStatus: "REJECTED", confidence: 85 };
  }

  // OFFER signals
  const offerWords = [
    "offer letter", "pleased to offer", "job offer", "offer of employment",
    "compensation package", "we are delighted to offer", "congratulations on your offer",
  ];
  if (offerWords.some(w => text.includes(w))) {
    return { detectedType: "OFFER", suggestedStatus: "OFFER", confidence: 90 };
  }

  // INTERVIEW signals
  const interviewWords = [
    "interview", "schedule a call", "schedule a meeting", "next steps",
    "we'd like to speak", "we would like to speak", "phone screen",
    "video call", "technical round", "hiring manager", "recruiter call",
    "assessment", "coding test", "take-home", "shortlisted for",
  ];
  if (interviewWords.some(w => text.includes(w))) {
    return { detectedType: "INTERVIEW", suggestedStatus: "SCREENING", confidence: 80 };
  }

  // FOLLOWUP signals
  const followupWords = [
    "application received", "thank you for applying", "thank you for your interest",
    "we received your application", "application status", "under review",
    "application update", "we have received", "your application has been",
    "hiring opportunity", "job opportunity", "we are hiring", "currently hiring",
    "open position", "job opening",
  ];
  if (followupWords.some(w => text.includes(w))) {
    return { detectedType: "FOLLOWUP", suggestedStatus: "APPLIED", confidence: 75 };
  }

  return null;
}

// ── Match email to a job in pipeline ─────────────────────────────────────────
function matchJobByEmail(
  subject: string,
  from: string,
  snippet: string,
  jobs: { id: string; company: string; role: string }[]
): string | null {
  const text = (subject + " " + from + " " + snippet).toLowerCase();

  for (const job of jobs) {
    const company = job.company.toLowerCase();
    // Check if company name appears in email
    if (company.length > 2 && text.includes(company)) {
      return job.id;
    }
    // Check domain match (e.g. "google.com" matches "Google")
    const domain = company.replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    if (domain.length > 3 && (from.toLowerCase().includes(domain) || text.includes(domain))) {
      return job.id;
    }
  }
  return null;
}
async function classifyEmail(
  subject: string,
  from: string,
  snippet: string,
  jobs: { id: string; company: string; role: string }[]
): Promise<{
  detectedType: string;
  suggestedStatus: string | null;
  confidence: number;
  matchedJobId: string | null;
  detectedCompany: string;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const jobList = jobs
    .slice(0, 20)
    .map(j => `- ID: ${j.id} | Company: ${j.company} | Role: ${j.role}`)
    .join("\n");

  const prompt = `Analyze this email and classify it as job-related or not.

Email Subject: ${subject}
From: ${from}
Preview: ${snippet.slice(0, 500)}

User's tracked job applications:
${jobList || "None tracked yet"}

Respond in JSON only:
{
  "isJobRelated": true,
  "detectedType": "INTERVIEW" | "REJECTION" | "OFFER" | "FOLLOWUP" | "OTHER",
  "suggestedStatus": "SCREENING" | "INTERVIEWING" | "OFFER" | "REJECTED" | null,
  "confidence": 0-100,
  "matchedJobId": "job id or null",
  "detectedCompany": "company name from email"
}

Rules:
- INTERVIEW: interview invite, schedule a call, "next steps", "we'd like to meet"
- REJECTION: "unfortunately", "not moving forward", "other candidates", "not selected", "regret"
- OFFER: "offer letter", "pleased to offer", "congratulations", "compensation"
- FOLLOWUP: "application received", "thank you for applying", "under review", "we received"
- Set isJobRelated=true for ANY hiring/recruitment/application email
- matchedJobId only if company clearly matches tracked list`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.isJobRelated) return null;

    return {
      detectedType:    parsed.detectedType || "FOLLOWUP",
      suggestedStatus: parsed.suggestedStatus || null,
      confidence:      Math.max(parsed.confidence || 50, 35),
      matchedJobId:    parsed.matchedJobId || null,
      detectedCompany: parsed.detectedCompany || "",
    };
  } catch {
    return null;
  }
}

// ── Main sync handler ─────────────────────────────────────────────────────────
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get fresh access token
    const accessToken = await getValidAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Gmail not connected. Sign out and sign in again to grant Gmail access." },
        { status: 400 }
      );
    }

    // Get all jobs for matching
    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      select: { id: true, company: true, role: true },
    });

    // Broad query
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const afterDate = `${thirtyDaysAgo.getFullYear()}/${String(thirtyDaysAgo.getMonth() + 1).padStart(2, "0")}/${String(thirtyDaysAgo.getDate()).padStart(2, "0")}`;

    const query = `after:${afterDate} (subject:interview OR subject:application OR subject:offer OR subject:hiring OR subject:recruitment OR subject:candidate OR subject:position OR subject:"job opportunity" OR subject:"thank you for applying" OR subject:"application received" OR subject:"application status" OR subject:"application update" OR subject:"moving forward" OR subject:"next steps" OR subject:"unfortunately" OR subject:"not selected" OR subject:"your application" OR subject:"we reviewed" OR subject:"talent" OR subject:"recruiter")`;

    // Fetch emails
    let messages: { id: string }[] = [];
    try {
      messages = await fetchGmailMessages(accessToken, query, 50);
          } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Gmail fetch error:", message);

      if (message.includes("401") || message.includes("invalid_grant") || message.includes("Invalid Credentials")) {
        // Mark as disconnected — user needs to sign in again
        await prisma.user.update({
          where: { id: session.user.id },
          data: { gmailConnected: false },
        });
        return NextResponse.json(
          { error: "Gmail access expired. Please sign out and sign in again to reconnect." },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: `Gmail error: ${message}` }, { status: 500 });
    }

    if (messages.length === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { gmailLastSync: new Date() },
      });
      return NextResponse.json({ synced: 0, suggestions: [], debug: "No emails matched the query" });
    }

    // Get already-processed email IDs
    const existingIds = new Set(
      (await prisma.gmailSuggestion.findMany({
        where: { userId: session.user.id },
        select: { emailId: true },
      })).map((s: { emailId: string }) => s.emailId)
    );

    const newSuggestions = [];
    let processed = 0;
    let skippedDuplicate = 0;
    let skippedClassification = 0;

    for (const msg of messages) {
      if (existingIds.has(msg.id)) { skippedDuplicate++; continue; }

      const detail = await fetchMessageDetail(accessToken, msg.id);
      if (!detail) continue;

      const headers  = detail.payload?.headers || [];
      const subject  = extractHeader(headers, "Subject");
      const from     = extractHeader(headers, "From");
      const dateHdr  = extractHeader(headers, "Date");
      const snippet  = decodeSnippet(detail.snippet || "");

      if (!subject && !snippet) continue;

      // Step 1: Try rule-based classification first (fast, reliable)
      let classification = ruleBasedClassify(subject, snippet);

      // Step 2: If rules don't match, try AI
      if (!classification) {
        const aiResult = await classifyEmail(subject, from, snippet, jobs);
        if (aiResult && aiResult.detectedType !== "OTHER") {
          classification = {
            detectedType:    aiResult.detectedType,
            suggestedStatus: aiResult.suggestedStatus,
            confidence:      aiResult.confidence,
          };
        }
      }

      if (!classification) {
        skippedClassification++;
        continue;
      }

      // Match to a job in pipeline
      const matchedJobId = matchJobByEmail(subject, from, snippet, jobs);

      await prisma.gmailSuggestion.create({
        data: {
          userId:          session.user.id,
          jobId:           matchedJobId || null,
          emailId:         msg.id,
          emailSubject:    subject || "(no subject)",
          emailFrom:       from,
          emailDate:       dateHdr ? new Date(dateHdr) : new Date(),
          detectedType:    classification.detectedType,
          suggestedStatus: classification.suggestedStatus,
          confidence:      classification.confidence,
          snippet:         snippet.slice(0, 300),
          status:          "PENDING",
        },
      });

      newSuggestions.push({ subject, from, type: classification.detectedType });
      processed++;

      if (processed >= 15) break;
      await new Promise(r => setTimeout(r, 150));
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { gmailLastSync: new Date() },
    });

    return NextResponse.json({
      synced: processed,
      debug: {
        totalFound: messages.length,
        skippedDuplicate,
        skippedClassification,
        saved: processed,
      },
    });
  } catch (error) {
    console.error("Gmail sync error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET — fetch pending suggestions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [suggestions, user] = await Promise.all([
      prisma.gmailSuggestion.findMany({
        where: { userId: session.user.id, status: "PENDING" },
        include: { job: { select: { id: true, company: true, role: true, status: true } } },
        orderBy: { emailDate: "desc" },
        take: 20,
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { gmailConnected: true, gmailLastSync: true },
      }),
    ]);

    return NextResponse.json({
      suggestions,
      gmailConnected: user?.gmailConnected || false,
      lastSync: user?.gmailLastSync || null,
    });
  } catch (error) {
    console.error("GET /api/gmail/sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
