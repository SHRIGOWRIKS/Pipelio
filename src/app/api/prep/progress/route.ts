import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role  = searchParams.get("role") || "";
  const level = searchParams.get("level") || "";

  const progress = await prisma.prepProgress.findMany({
    where: { userId: session.user.id, role, level },
  });

  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, level, topic, done } = await req.json();

  const progress = await prisma.prepProgress.upsert({
    where: { userId_role_level_topic: { userId: session.user.id, role, level, topic } },
    create: { userId: session.user.id, role, level, topic, done },
    update: { done },
  });

  return NextResponse.json(progress);
}
