import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// This endpoint is called by a cron job (Vercel Cron or external)
// Protected by a secret key
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_your_api_key") {
      return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.FROM_EMAIL || "noreply@pipelio.app";

    // Find users with stale applications (14+ days in APPLIED)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const usersWithStaleJobs = await prisma.user.findMany({
      where: {
        email: { not: null },
        jobs: {
          some: {
            status: "APPLIED",
            updatedAt: { lt: cutoff },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        jobs: {
          where: { status: "APPLIED", updatedAt: { lt: cutoff } },
          select: { company: true, role: true, updatedAt: true },
          take: 5,
        },
      },
    });

    let sent = 0;
    for (const user of usersWithStaleJobs) {
      if (!user.email) continue;

      const staleCount = user.jobs.length;
      const firstName = user.name?.split(" ")[0] || "there";

      const jobList = user.jobs
        .map((j: { company: string; role: string; updatedAt: Date }) => {
          const days = Math.floor((Date.now() - new Date(j.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
          return `<li style="margin-bottom:8px;"><strong>${j.role}</strong> at ${j.company} — ${days} days with no response</li>`;
        })
        .join("");

      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: `${staleCount} application${staleCount !== 1 ? "s" : ""} may be going cold — time to follow up`,
        html: `
          <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1C1C1E;">
            <div style="background:#6B9E78;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h1 style="color:white;margin:0;font-size:20px;">Pipelio Weekly Digest</h1>
              <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Your job search update</p>
            </div>

            <p style="font-size:15px;margin-bottom:16px;">Hey ${firstName},</p>
            <p style="font-size:14px;color:#6B7280;line-height:1.6;margin-bottom:20px;">
              You have <strong style="color:#1C1C1E;">${staleCount} application${staleCount !== 1 ? "s" : ""}</strong> that haven't had any activity in 14+ days. Now is a great time to send a follow-up email.
            </p>

            <div style="background:#FEF9EE;border:1px solid #F5DFA0;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
              <p style="font-size:12px;font-weight:600;color:#92681A;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Applications to follow up on</p>
              <ul style="margin:0;padding-left:16px;color:#92681A;font-size:14px;">
                ${jobList}
              </ul>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#6B9E78;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              Open Pipelio →
            </a>

            <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">
              You're receiving this because you have a Pipelio account. 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#6B9E78;">Manage notifications</a>
            </p>
          </div>
        `,
      });

      sent++;
    }

    return NextResponse.json({ sent, total: usersWithStaleJobs.length });
  } catch (error) {
    console.error("Weekly notification error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
