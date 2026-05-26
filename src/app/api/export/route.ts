import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { appliedDate: "desc" },
    });

    const headers = [
      "Company",
      "Role",
      "Status",
      "Location",
      "Salary",
      "Applied Date",
      "Deadline",
      "Job URL",
      "Notes",
    ];

    const rows = jobs.map((job: typeof jobs[number]) => [
      job.company,
      job.role,
      job.status,
      job.location || "",
      job.salary || "",
      new Date(job.appliedDate).toLocaleDateString(),
      job.deadline ? new Date(job.deadline).toLocaleDateString() : "",
      job.jobUrl || "",
      (job.notes || "").replace(/,/g, ";"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell: string) => `"${cell}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="job-applications-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
