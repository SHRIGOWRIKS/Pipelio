import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL!));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  if (!user?.onboarded) {
    return NextResponse.redirect(new URL("/onboarding", process.env.NEXTAUTH_URL!));
  }

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL!));
}
