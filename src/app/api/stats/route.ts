import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      select: { status: true, appliedDate: true, createdAt: true },
    });

    const total = jobs.length;
    const byStatus: Record<JobStatus, number> = {
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    jobs.forEach((job: { status: string; appliedDate: Date; createdAt: Date }) => {
      byStatus[job.status as JobStatus]++;
    });

    const responseRate =
      total > 0
        ? Math.round(
            ((byStatus.SCREENING +
              byStatus.INTERVIEWING +
              byStatus.OFFER +
              byStatus.REJECTED) /
              total) *
              100
          )
        : 0;

    const interviewRate =
      total > 0
        ? Math.round(
            ((byStatus.INTERVIEWING + byStatus.OFFER) / total) * 100
          )
        : 0;

    const offerRate =
      total > 0 ? Math.round((byStatus.OFFER / total) * 100) : 0;

    // Monthly applications for chart
    const monthlyData: Record<string, number> = {};
    jobs.forEach((job: { status: string; appliedDate: Date; createdAt: Date }) => {
      const month = new Date(job.appliedDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthly = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);

    return NextResponse.json({
      total,
      byStatus,
      responseRate,
      interviewRate,
      offerRate,
      monthly,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
