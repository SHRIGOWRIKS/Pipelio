"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";

interface LogoLinkProps {
  isLoggedIn?: boolean;
}

export default function LogoLink({ isLoggedIn: _ }: LogoLinkProps) {
  // Logo always navigates to the landing page (home)
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-8 h-8 bg-[#6B9E78] rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-90">
        <Briefcase size={15} className="text-white" />
      </div>
      <span className="font-bold text-[#1C1C1E] text-lg tracking-tight">
        Pipelio
      </span>
    </Link>
  );
}
