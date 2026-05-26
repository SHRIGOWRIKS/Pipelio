import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET — fetch existing token
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiToken: true },
    });

    return NextResponse.json({ token: user?.apiToken || null });
  } catch (error) {
    console.error("GET /api/token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — generate a new token
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiToken: token },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("POST /api/token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
