import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Pipelio to track your job applications.",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <LoginClient />;
}
