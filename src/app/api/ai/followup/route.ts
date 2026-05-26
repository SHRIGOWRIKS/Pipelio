import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, role, appliedDate, location, jobUrl } = await req.json();
    if (!company || !role) {
      return NextResponse.json({ error: "Company and role are required" }, { status: 400 });
    }

    const model = getModel();

    const daysSince = appliedDate
      ? Math.floor((Date.now() - new Date(appliedDate).getTime()) / (1000 * 60 * 60 * 24))
      : 14;

    const prompt = [
      "Write a professional follow-up email for a job application. Return ONLY valid JSON (no markdown):",
      "",
      "Details:",
      "- Company: " + company,
      "- Role: " + role,
      "- Applied: " + daysSince + " days ago",
      location ? "- Location: " + location : "",
      jobUrl ? "- Job URL: " + jobUrl : "",
      "",
      "{",
      '  "subject": "Following up on my application for [Role] at [Company]",',
      '  "body": "Full email body (3-4 short paragraphs, professional but warm tone, under 200 words)",',
      '  "tip": "One tip for sending this follow-up"',
      "}",
      "",
      "Rules:",
      "- Open with a brief, confident re-introduction",
      "- Mention specific enthusiasm for the company/role",
      "- Ask politely about timeline or next steps",
      "- End with a clear call to action",
      "- Do NOT use placeholders like [Your Name] — write it as a complete email",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const data = parseAIJson(result.response.text());
    if (!data) {
      return NextResponse.json({ error: "Failed to generate email. Try again." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Follow-up email error:", error);
    return NextResponse.json({ error: "Failed to generate email. Try again." }, { status: 500 });
  }
}
