import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getModel, parseAIJson } from "@/lib/ai-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { offerAmount, role, location, yearsExp, currentSalary, currency } = await req.json();
    if (!offerAmount || !role) return NextResponse.json({ error: "Offer amount and role required" }, { status: 400 });

    const model = getModel();

    const offer = Number(offerAmount);
    const current = currentSalary ? Number(currentSalary) : null;

    const prompt = [
      "You are an objective salary analyst. Analyze this job offer accurately based on real 2024-2025 market data.",
      "Be HONEST — if the offer is good, say so. Do NOT always say below market.",
      "",
      "Offer Details:",
      "- Role: " + role,
      "- Offered: " + currency + offer.toLocaleString(),
      "- Location: " + (location || "Not specified"),
      "- Experience: " + (yearsExp || "Not specified"),
      current ? "- Current salary: " + currency + current.toLocaleString() : "",
      "",
      "Instructions:",
      "1. Research realistic market ranges for this EXACT role, level, and location in 2024-2025",
      "2. Compare the offer to the market range OBJECTIVELY",
      "3. verdict must be one of: below_market (offer < 85% of mid), at_market (85-110% of mid), above_market (>110% of mid)",
      "4. counterOffer: if below_market suggest 10-15% higher; if at_market suggest 5-8% higher; if above_market suggest 2-5% higher or same",
      "5. walkAwayPoint: minimum acceptable (usually current salary or 90% of offer, whichever is higher)",
      "",
      "Return ONLY valid JSON (no markdown, no backticks):",
      "{",
      '  "marketRange": { "low": 0, "mid": 0, "high": 0 },',
      '  "verdict": "below_market or at_market or above_market",',
      '  "verdictLabel": "Below Market or At Market or Above Market",',
      '  "counterOffer": 0,',
      '  "counterScript": "Professional negotiation email script (150 words, confident but not pushy)",',
      '  "reasoning": "Specific reasoning with market data — mention actual salary ranges for this role/location",',
      '  "negotiationTips": ["specific tip 1", "specific tip 2", "specific tip 3"],',
      '  "otherBenefitsToNegotiate": ["benefit 1", "benefit 2", "benefit 3"],',
      '  "walkAwayPoint": 0',
      "}",
      "",
      "IMPORTANT: All monetary values as plain numbers (no currency symbols, no commas).",
      "Be accurate — a $150k offer for a Senior Engineer in SF is at_market or above_market, not below_market.",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const data = parseAIJson(raw);

    if (!data) return NextResponse.json({ error: "Failed to generate analysis. Try again." }, { status: 500 });

    // Sanity check: correct verdict based on actual ratio
    const parsed = data as any;
    if (parsed.marketRange?.mid && parsed.verdict) {
      const mid = Number(parsed.marketRange.mid);
      const ratio = mid > 0 ? offer / mid : 1;

      // If offer is within 40% of mid (ratio >= 0.60), treat as at_market minimum
      if (ratio >= 0.60 && parsed.verdict === "below_market") {
        parsed.verdict = "at_market";
        parsed.verdictLabel = "At Market";
      } else if (ratio > 1.10 && parsed.verdict !== "above_market") {
        parsed.verdict = "above_market";
        parsed.verdictLabel = "Above Market";
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Salary negotiation error:", error);
    return NextResponse.json({ error: "Failed to analyze offer. Try again." }, { status: 500 });
  }
}
