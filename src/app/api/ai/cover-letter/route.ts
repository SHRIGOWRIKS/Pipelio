import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobDescription, resumeText, tone } = await req.json();
    if (!jobDescription || !resumeText) {
      return NextResponse.json({ error: "Job description and resume are required" }, { status: 400 });
    }

    const model = await getModel();

    const toneGuide = tone === "formal" ? "formal and professional"
      : tone === "casual" ? "conversational but professional"
      : "confident and enthusiastic";

    const prompt = [
      "Write a cover letter. Return ONLY valid JSON (no markdown, no backticks):",
      "Tone: " + toneGuide + ". Max 350 words.",
      "",
      "Job Description:",
      jobDescription.slice(0, 2000),
      "",
      "Resume:",
      resumeText.slice(0, 2000),
      "",
      "Rules: Strong opening hook. Highlight 2-3 matching achievements. No placeholders.",
      "",
      "{",
      '  "subject": "Application subject line",',
      '  "body": "Full cover letter body text",',
      '  "tips": ["tip1", "tip2", "tip3"]',
      "}",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const data = parseAIJson(result.response.text());
    if (!data) return NextResponse.json({ error: "Failed to generate cover letter. Try again." }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter. Try again." }, { status: 500 });
  }
}
