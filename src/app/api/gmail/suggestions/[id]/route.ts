import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { action, jobId, overrideStatus } = body;
    // action: "accept" | "dismiss"
    // jobId: the job to update (optional)
    // overrideStatus: force a specific status (optional)

    const suggestion = await prisma.gmailSuggestion.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "accept") {
      const targetJobId = jobId || suggestion.jobId;
      const targetStatus = overrideStatus || suggestion.suggestedStatus;

      if (targetJobId && targetStatus) {
        // Update job status
        await prisma.job.update({
          where: { id: targetJobId },
          data: { status: targetStatus as any },
        });

        // Add timeline event
        await prisma.timeline.create({
          data: {
            jobId: targetJobId,
            event: `Status updated via Gmail`,
            note: `Detected: ${suggestion.detectedType} — "${suggestion.emailSubject}"`,
          },
        });
      }
    }

    // Mark suggestion as handled
    await prisma.gmailSuggestion.update({
      where: { id },
      data: { status: action === "accept" ? "ACCEPTED" : "DISMISSED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH suggestion error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
