import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import JobDetailClient from "./JobDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return { title: "Job Detail" };

  const job = await prisma.job.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) return { title: "Job Not Found" };

  return {
    title: `${job.role} at ${job.company}`,
    description: `Track your application for ${job.role} at ${job.company}.`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, userId: session?.user?.id ?? "" },
    include: {
      contacts: true,
      timeline: { orderBy: { date: "desc" } },
    },
  });

  if (!job) notFound();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar session={session} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobDetailClient job={job as any} />
      </main>
    </div>
  );
}
