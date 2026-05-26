import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobDescription, resumeText } = await req.json();
    if (!jobDescription) return NextResponse.json({ error: "Job description is required" }, { status: 400 });

    const model = getModel();

    const prompt = [
      "Generate interview prep for this job. Return ONLY valid JSON (no markdown, no backticks):",
      "",
      "Job Description:",
      jobDescription.slice(0, 2000),
      resumeText ? "\nResume:\n" + resumeText.slice(0, 1500) : "",
      "",
      "{",
      '  "role": "job title",',
      '  "company": "company name",',
      '  "questions": [',
      '    { "category": "Behavioral", "question": "question text", "why": "why asked", "hint": "key points", "framework": "STAR" }',
      "  ],",
      '  "keyTopics": ["topic1", "topic2", "topic3"],',
      '  "redFlags": ["concern1"],',
      '  "questionsToAsk": ["question to ask interviewer 1", "question 2"]',
      "}",
      "Include 8 questions: 3 behavioral, 3 technical, 2 situational.",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const data = parseAIJson(result.response.text());
    if (!data) return NextResponse.json({ error: "Failed to generate interview prep. Try again." }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Interview prep error:", error);
    return NextResponse.json({ error: "Failed to generate interview prep. Try again." }, { status: 500 });
  }
}
