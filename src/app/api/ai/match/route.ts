import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Both resume and job description required" }, { status: 400 });
    }

    const model = await getModel();

    const prompt = [
      "Compare this resume against the job description. Return ONLY valid JSON (no markdown, no backticks):",
      "",
      "Resume:",
      resumeText.slice(0, 2500),
      "",
      "Job Description:",
      jobDescription.slice(0, 2000),
      "",
      "{",
      '  "matchScore": 75,',
      '  "matchedSkills": ["skill1", "skill2"],',
      '  "missingSkills": ["skill3", "skill4"],',
      '  "summary": "2 sentence match summary",',
      '  "tips": ["tip1", "tip2", "tip3"]',
      "}",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const data = parseAIJson(result.response.text());
    if (!data) return NextResponse.json({ error: "Failed to parse AI response. Try again." }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Failed to check match. Try again." }, { status: 500 });
  }
}
