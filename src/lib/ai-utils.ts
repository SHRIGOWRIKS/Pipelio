import { GoogleGenerativeAI } from "@google/generative-ai";

export function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI not configured");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

export function parseAIJson(text: string): object | null {
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
    // Try to recover truncated JSON
    const partial = match[0];
    const lastComma = partial.lastIndexOf(",");
    if (lastComma > 0) {
      try { return JSON.parse(partial.slice(0, lastComma) + "}"); } catch { /* fall through */ }
    }
    return null;
  }
}
