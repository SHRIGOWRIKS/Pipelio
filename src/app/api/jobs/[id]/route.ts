import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  status: z
    .enum(["APPLIED", "SCREENING", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"])
    .optional(),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional().nullable(),
  interviewRound: z.string().optional().nullable(),
  resumeVersionId: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findFirst({
      where: { id, userId: session.user.id },
      include: {
        contacts: true,
        timeline: { orderBy: { date: "desc" } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateJobSchema.parse(body);

    const existing = await prisma.job.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Track status change in timeline
    if (data.status && data.status !== existing.status) {
      await prisma.timeline.create({
        data: {
          jobId: id,
          event: `Status changed to ${data.status}`,
          note: `Moved from ${existing.status} to ${data.status}`,
        },
      });

      // Silently collect anonymized company insight data
      try {
        const appliedDate = existing.appliedDate;
        const daysSinceApplied = appliedDate
          ? Math.floor((Date.now() - new Date(appliedDate).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const terminalStatuses = ["OFFER", "REJECTED"];
        const responseStatuses = ["SCREENING", "INTERVIEWING", "OFFER", "REJECTED"];

        if (responseStatuses.includes(data.status) && existing.status === "APPLIED") {
          // First response from applied
          await prisma.companyInsight.create({
            data: {
              company: existing.company,
              appliedToResponse: daysSinceApplied,
              outcome: data.status === "OFFER" ? "OFFER"
                : data.status === "REJECTED" ? "REJECTED"
                : "RESPONDED",
            },
          });
        } else if (terminalStatuses.includes(data.status)) {
          // Terminal outcome
          await prisma.companyInsight.create({
            data: {
              company: existing.company,
              appliedToOffer:  data.status === "OFFER"     ? daysSinceApplied : null,
              appliedToReject: data.status === "REJECTED"  ? daysSinceApplied : null,
              outcome: data.status as string,
            },
          });
        }
      } catch { /* non-fatal — insights collection should never break the main flow */ }
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : data.deadline,
      },
      include: {
        contacts: true,
        timeline: { orderBy: { date: "desc" } },
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.job.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
