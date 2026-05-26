import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No session" });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({
    sessionUserId: session.user.id,
    sessionEmail: session.user.email,
    userInDB: user,
    match: !!user,
  });
}
