import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PrepClient from "./PrepClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Prep",
  description: "Role-specific interview preparation — questions, coding challenges, system design, and more.",
};

export default async function PrepPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <Navbar session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrepClient />
      </main>
    </div>
  );
}
