import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role  = searchParams.get("role");
  const level = searchParams.get("level");

  const bookmarks = await prisma.prepBookmark.findMany({
    where: {
      userId: session.user.id,
      ...(role  ? { role }  : {}),
      ...(level ? { level } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, level, category, questionId, question, answer } = await req.json();

  const bookmark = await prisma.prepBookmark.upsert({
    where: { userId_questionId: { userId: session.user.id, questionId } },
    create: { userId: session.user.id, role, level, category, questionId, question, answer },
    update: {},
  });

  return NextResponse.json(bookmark);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId } = await req.json();

  await prisma.prepBookmark.deleteMany({
    where: { userId: session.user.id, questionId },
  });

  return NextResponse.json({ success: true });
}
