import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingClient from "./OnboardingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description: "Complete your Pipelio profile to personalize your job search experience.",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, name: true },
  });

  // Already onboarded — skip
  if (user?.onboarded) redirect("/dashboard");

  return <OnboardingClient name={user?.name || ""} />;
}
