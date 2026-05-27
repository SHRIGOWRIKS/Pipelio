import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, fileUrl, notes, isDefault } = await req.json();

    const existing = await prisma.resumeVersion.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (isDefault) {
      await prisma.resumeVersion.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const version = await prisma.resumeVersion.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(fileUrl !== undefined ? { fileUrl } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error("PATCH /api/vault/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.resumeVersion.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.resumeVersion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/vault/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
