import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({ where: { id, userId: session.user.id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const debrief = await prisma.interviewDebrief.findUnique({ where: { jobId: id } });
    return NextResponse.json(debrief || null);
  } catch (error) {
    console.error("GET debrief error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Verify job belongs to user
    const job = await prisma.job.findFirst({ where: { id, userId: session.user.id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const debrief = await prisma.interviewDebrief.upsert({
      where: { jobId: id },
      create: {
        jobId: id,
        userId: session.user.id,
        technicalQs:     body.technicalQs     || null,
        behavioralQs:    body.behavioralQs    || null,
        cultureScore:    body.cultureScore    ? Number(body.cultureScore) : null,
        interviewerName: body.interviewerName || null,
        interviewDate:   body.interviewDate   ? new Date(body.interviewDate) : null,
        notes:           body.notes           || null,
        round:           body.round           || null,
      },
      update: {
        technicalQs:     body.technicalQs     ?? undefined,
        behavioralQs:    body.behavioralQs    ?? undefined,
        cultureScore:    body.cultureScore    ? Number(body.cultureScore) : undefined,
        interviewerName: body.interviewerName ?? undefined,
        interviewDate:   body.interviewDate   ? new Date(body.interviewDate) : undefined,
        notes:           body.notes           ?? undefined,
        round:           body.round           ?? undefined,
      },
    });

    // Add timeline event
    await prisma.timeline.create({
      data: {
        jobId: id,
        event: "Interview debrief logged",
        note: body.round ? `Round: ${body.round}` : undefined,
      },
    });

    return NextResponse.json(debrief);
  } catch (error) {
    console.error("POST debrief error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
