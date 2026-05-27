import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE() {
  try {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.gmailSuggestion.deleteMany({ where: { userId } });
    await prisma.prepBookmark.deleteMany({ where: { userId } });
    await prisma.prepProgress.deleteMany({ where: { userId } });
    await prisma.interviewDebrief.deleteMany({ where: { userId } });
    await prisma.resumeVersion.deleteMany({ where: { userId } });
    await prisma.job.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
