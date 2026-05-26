import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  currentRole:     z.string().optional(),
  yearsExp:        z.string().optional(),
  targetRoles:     z.string().optional(),
  targetCompanies: z.string().optional(),
  skills:          z.string().optional(),
  jobSearchStatus: z.string().optional(),
  location:        z.string().optional(),
  linkedinUrl:     z.string().optional(),
  onboarded:       z.boolean().optional(),
  // Autofill fields
  phone:           z.string().optional(),
  addressLine1:    z.string().optional(),
  addressLine2:    z.string().optional(),
  city:            z.string().optional(),
  state:           z.string().optional(),
  zipCode:         z.string().optional(),
  country:         z.string().optional(),
  portfolioUrl:    z.string().optional(),
  githubUrl:       z.string().optional(),
  pronouns:        z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true, email: true, image: true,
        currentRole: true, yearsExp: true, targetRoles: true,
        targetCompanies: true, skills: true, jobSearchStatus: true,
        location: true, linkedinUrl: true, onboarded: true,
        phone: true, addressLine1: true, addressLine2: true,
        city: true, state: true, zipCode: true, country: true,
        portfolioUrl: true, githubUrl: true, pronouns: true,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const data = profileSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        name: true, email: true, image: true,
        currentRole: true, yearsExp: true, targetRoles: true,
        targetCompanies: true, skills: true, jobSearchStatus: true,
        location: true, linkedinUrl: true, onboarded: true,
        phone: true, addressLine1: true, addressLine2: true,
        city: true, state: true, zipCode: true, country: true,
        portfolioUrl: true, githubUrl: true, pronouns: true,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
