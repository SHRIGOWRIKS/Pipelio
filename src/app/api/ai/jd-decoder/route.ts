import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

function extractJSON(text: string): object | null {
  // Strip markdown code fences
  const cleaned = text
    .replace(/^```[\w]*\s*/gm, "")
    .replace(/^```\s*/gm, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    // Try to fix truncated JSON by finding last complete field
    const partial = match[0];
    const lastComma = partial.lastIndexOf(",");
    if (lastComma > 0) {
      try {
        return JSON.parse(partial.slice(0, lastComma) + "}");
      } catch { return null; }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription } = await req.json();
    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Simplified prompt — fewer fields = more reliable JSON
    const prompt = [
      "Analyze this job description and return ONLY valid JSON (no markdown, no backticks):",
      "",
      "Job Description:",
      jobDescription.slice(0, 2500),
      "",
      "Return this exact JSON structure:",
      "{",
      '  "role": "job title",',
      '  "company": "company name or Unknown",',
      '  "seniorityLevel": "Junior or Mid or Senior or Lead",',
      '  "actualRequirements": ["required skill 1", "required skill 2", "required skill 3"],',
      '  "niceToHave": ["optional skill 1", "optional skill 2"],',
      '  "redFlags": ["red flag 1 or none"],',
      '  "greenFlags": ["positive signal 1", "positive signal 2"],',
      '  "cultureSignals": ["culture insight 1", "culture insight 2"],',
      '  "salaryInsight": "estimated salary range and reasoning in one sentence",',
      '  "competitionLevel": "Low or Medium or High or Very High",',
      '  "applyAdvice": "2 sentence honest advice on applying",',
      '  "hiddenRequirements": ["unstated expectation 1"],',
      '  "keywordsToUse": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]',
      "}",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const data = extractJSON(rawText);
    if (!data) {
      console.error("JD decoder: no JSON found in:", rawText.slice(0, 300));
      return NextResponse.json(
        { error: "AI returned unexpected format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("JD decoder error:", error);
    return NextResponse.json(
      { error: "Failed to decode job description. Please try again." },
      { status: 500 }
    );
  }
}
