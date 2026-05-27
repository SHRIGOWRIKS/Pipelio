import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeText } = await req.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

    const model = getModel();

    const prompt = [
      "Analyze this resume. Return ONLY valid JSON (no markdown, no backticks):",
      "",
      "Resume:",
      resumeText.slice(0, 3500),
      "",
      "{",
      '  "summary": "2-3 sentence professional summary",',
      '  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],',
      '  "level": "Junior or Mid or Senior",',
      '  "improvements": ["suggestion1", "suggestion2", "suggestion3"]',
      "}",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const data = parseAIJson(result.response.text());
    if (!data) return NextResponse.json({ error: "Failed to parse AI response. Try again." }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Resume error:", error);
    return NextResponse.json({ error: "Failed to analyze resume. Try again." }, { status: 500 });
  }
}
