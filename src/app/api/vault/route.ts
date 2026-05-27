import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const versions = await prisma.resumeVersion.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { jobs: true } } },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("GET /api/vault error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { name, fileUrl, notes, isDefault, filePath } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // If setting as default, unset others
    if (isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const version = await prisma.resumeVersion.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        fileUrl: fileUrl || null,
        filePath: filePath || null,
        notes: notes || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("POST /api/vault error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const code = (error as any)?.code;
    const meta = (error as any)?.meta;
    return NextResponse.json({ error: msg, code, meta }, { status: 500 });
  }
}
