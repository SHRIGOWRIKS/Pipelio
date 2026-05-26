import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all user data in correct order (cascade handles most, but be explicit)
    await prisma.gmailSuggestion.deleteMany({ where: { userId } });
    await prisma.prepBookmark.deleteMany({ where: { userId } });
    await prisma.prepProgress.deleteMany({ where: { userId } });
    await prisma.interviewDebrief.deleteMany({ where: { userId } });
    await prisma.resumeVersion.deleteMany({ where: { userId } });

    // Delete jobs (cascades contacts, timeline, debrief)
    await prisma.job.deleteMany({ where: { userId } });

    // Delete auth data
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });

    // Delete user (last)
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
