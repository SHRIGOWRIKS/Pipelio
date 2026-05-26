import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import StatsClient from "./StatsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  description: "View your job search statistics and insights.",
};

export default async function StatsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsClient />
      </main>
    </div>
  );
}
