import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — fetch anonymized insights for a company
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company");

    if (!company) {
      return NextResponse.json({ error: "Company required" }, { status: 400 });
    }

    // Case-insensitive search
    const insights = await prisma.companyInsight.findMany({
      where: {
        company: { contains: company, mode: "insensitive" },
      },
      select: {
        appliedToResponse: true,
        appliedToOffer: true,
        appliedToReject: true,
        outcome: true,
        createdAt: true,
      },
    });

    if (insights.length === 0) {
      return NextResponse.json({ company, count: 0, insights: null });
    }

    const count = insights.length;

    // Avg response time (days)
    const responseTimes = insights
      .map((i: { appliedToResponse: number | null }) => i.appliedToResponse)
      .filter((v): v is number => v !== null && v > 0);
    const avgResponseDays = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : null;

    // Outcome breakdown
    const outcomes = {
      responded: insights.filter((i: { outcome: string | null }) => i.outcome === "RESPONDED").length,
      offer:     insights.filter((i: { outcome: string | null }) => i.outcome === "OFFER").length,
      rejected:  insights.filter((i: { outcome: string | null }) => i.outcome === "REJECTED").length,
      ghosted:   insights.filter((i: { outcome: string | null }) => i.outcome === "GHOSTED").length,
    };

    const responseRate = count > 0
      ? Math.round(((outcomes.responded + outcomes.offer + outcomes.rejected) / count) * 100)
      : 0;

    const offerRate = count > 0
      ? Math.round((outcomes.offer / count) * 100)
      : 0;

    return NextResponse.json({
      company,
      count,
      avgResponseDays,
      responseRate,
      offerRate,
      outcomes,
    });
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
