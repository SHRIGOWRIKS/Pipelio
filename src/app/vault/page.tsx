import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import VaultClient from "./VaultClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Vault",
  description: "Manage your resume versions and link them to job applications.",
};

export default async function VaultPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <Navbar session={session} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VaultClient />
      </main>
    </div>
  );
}
