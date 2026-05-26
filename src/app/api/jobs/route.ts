import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Helper: resolve user from session OR Bearer token
async function resolveUserId(req: NextRequest): Promise<string | null> {
  // Try session first
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // Try Bearer token (from Chrome extension)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await prisma.user.findUnique({
      where: { apiToken: token },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  return null;
}

const createJobSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z
    .enum(["APPLIED", "SCREENING", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"])
    .default("APPLIED"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        ...(status && status !== "ALL" ? { status: status as any } : {}),
        ...(search
          ? {
              OR: [
                { company: { contains: search, mode: "insensitive" } },
                { role: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        contacts: true,
        timeline: { orderBy: { date: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...data,
        userId,
        jobUrl: data.jobUrl || null,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        contacts: true,
        timeline: true,
      },
    });

    // Add initial timeline event
    await prisma.timeline.create({
      data: {
        jobId: job.id,
        event: "Application submitted",
        note: `Applied for ${data.role} at ${data.company}`,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
