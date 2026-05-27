export async function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI not configured");
  // Lazy import to avoid build-time issues
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

export function parseAIJson(text: string): object | null {
  const cleaned = text
    .replace(/^```[\w]*\s*/gm, "")
    .replace(/^```\s*/gm, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    const partial = match[0];
    const lastComma = partial.lastIndexOf(",");
    if (lastComma > 0) {
      try { return JSON.parse(partial.slice(0, lastComma) + "}"); } catch { /* fall through */ }
    }
    return null;
  }
}
