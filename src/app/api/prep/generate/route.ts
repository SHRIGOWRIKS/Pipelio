import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, roleLabel, level, category } = body;

    if (!role || !level || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json({ error: "Gemini API key not configured. Add GEMINI_API_KEY to your .env file." }, { status: 503 });
    }

    // Lazy import to avoid module-level errors
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const levelDesc =
      level === "fresher" ? "entry-level (0-1 years, first job)" :
      level === "mid"     ? "mid-level (2-5 years)" :
                            "senior-level (5+ years, lead roles)";

    const isFrontend = ["react", "nextjs", "angular", "vue", "frontend-gen", "javascript", "typescript"].includes(role);

    let prompt = "";

    if (category === "roadmap") {
      prompt = [
        "Create an interview prep roadmap for a " + levelDesc + " " + roleLabel + ".",
        "Return ONLY valid JSON (no markdown, no backticks, no explanation):",
        "{",
        '  "topics": [',
        "    {",
        '      "id": "t1",',
        '      "title": "Topic Name",',
        '      "description": "What to study in 1-2 sentences",',
        '      "priority": "must-know",',
        '      "estimatedHours": 4,',
        '      "subtopics": ["sub1", "sub2", "sub3"]',
        "    }",
        "  ],",
        '  "totalWeeks": 4,',
        '  "studyPlan": "2-3 sentence advice",',
        '  "keyResources": [{ "name": "Resource", "url": "https://example.com", "type": "docs" }]',
        "}",
        "Include 8 topics. Priority values: must-know, important, good-to-know.",
      ].join("\n");

    } else if (category === "questions") {
      const jsHint = role === "javascript"
        ? "Focus on: closures, hoisting, event loop, promises/async-await, prototypes, this keyword, ES6+ features, DOM manipulation, debounce/throttle, memory leaks, IIFE, currying, memoization."
        : role === "typescript"
        ? "Focus on: type system, generics, interfaces vs types, utility types, decorators, strict mode, type guards, mapped types, conditional types, module system, tsconfig."
        : "";

      prompt = [
        "Generate 10 technical interview questions for a " + levelDesc + " " + roleLabel + ".",
        jsHint,
        "Return ONLY valid JSON (no markdown, no backticks, no explanation):",
        "{",
        '  "questions": [',
        "    {",
        '      "id": "q1",',
        '      "question": "The question",',
        '      "difficulty": "easy",',
        '      "topic": "Topic area",',
        '      "answer": "Answer in 3-4 sentences",',
        '      "followUp": "Follow-up question",',
        '      "tip": "One answering tip"',
        "    }",
        "  ]",
        "}",
        "Include 3 easy, 5 medium, 2 hard. Specific to " + roleLabel + " at " + levelDesc + ".",
      ].join("\n");

    } else if (category === "coding") {
      const lang = (role === "typescript") ? "typescript" :
        isFrontend ? "javascript" :
        (role.includes("python") || role.includes("data") || role.includes("ml")) ? "python" : "javascript";

      prompt = [
        "Generate 6 coding problems for a " + levelDesc + " " + roleLabel + " interview.",
        "Return ONLY valid JSON (no markdown, no backticks, no explanation):",
        "{",
        '  "problems": [',
        "    {",
        '      "id": "p1",',
        '      "title": "Problem Title",',
        '      "difficulty": "easy",',
        '      "topic": "Arrays",',
        '      "description": "Problem statement with example",',
        '      "examples": [{ "input": "example", "output": "result", "explanation": "why" }],',
        '      "hints": ["hint1", "hint2"],',
        '      "solution": "complete working code solution",',
        '      "language": "' + lang + '",',
        '      "timeComplexity": "O(n)",',
        '      "spaceComplexity": "O(1)",',
        '      "explanation": "Step by step explanation"',
        "    }",
        "  ]",
        "}",
        "Include 2 easy, 3 medium, 1 hard. Use " + lang + ". Focus on problems asked for " + roleLabel + ".",
      ].join("\n");

    } else if (category === "system") {
      const frontendHint = isFrontend
        ? "Include these frontend system design topics: real-time collaborative editor with WebSockets and CRDT; component library architecture; infinite scroll with virtualization; real-time chat frontend; micro-frontend architecture; offline-first PWA with sync."
        : "Tailor to " + roleLabel + " — backend gets distributed systems, data gets pipelines.";

      prompt = [
        "Generate 6 system design interview questions for a " + levelDesc + " " + roleLabel + ".",
        frontendHint,
        "Return ONLY valid JSON (no markdown, no backticks, no explanation):",
        "{",
        '  "questions": [',
        "    {",
        '      "id": "sd1",',
        '      "question": "Design [system]",',
        '      "difficulty": "medium",',
        '      "timeLimit": "45 mins",',
        '      "keyComponents": ["component1", "component2"],',
        '      "approach": "Step by step approach (4-6 numbered steps)",',
        '      "considerations": ["scalability", "performance"],',
        '      "sampleAnswer": "Comprehensive answer 150-200 words"',
        "    }",
        "  ]",
        "}",
      ].join("\n");

    } else if (category === "behavioral") {
      prompt = [
        "Generate 10 behavioral interview questions for a " + levelDesc + " " + roleLabel + ".",
        "Return ONLY valid JSON (no markdown, no backticks, no explanation):",
        "{",
        '  "questions": [',
        "    {",
        '      "id": "b1",',
        '      "question": "Tell me about a time when...",',
        '      "category": "Leadership",',
        '      "whyAsked": "What interviewer looks for",',
        '      "starTemplate": {',
        '        "situation": "What situation to describe",',
        '        "task": "Your role",',
        '        "action": "Actions to highlight",',
        '        "result": "Results to mention"',
        "      },",
        '      "sampleAnswer": "STAR format answer 100-150 words",',
        '      "tip": "One specific tip"',
        "    }",
        "  ]",
        "}",
        "Category values: Leadership, Conflict, Failure, Achievement, Teamwork, Growth",
      ].join("\n");

    } else {
      return NextResponse.json({ error: "Invalid category: " + category }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```[\w]*\s*/gm, "")
      .replace(/^```\s*/gm, "")
      .trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[prep/generate] No JSON found. Raw:", rawText.slice(0, 400));
      return NextResponse.json(
        { error: "AI returned unexpected format. Please try again." },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[prep/generate] Parse error:", parseErr, "\nRaw:", jsonMatch[0].slice(0, 400));
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ category, role, level, data });

  } catch (error) {
    console.error("[prep/generate] Unhandled error:", error);
    return NextResponse.json(
      { error: "Generation failed: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
