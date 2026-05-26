"use client";

import { Job } from "@/types";
import { Flame, X } from "lucide-react";
import { useState } from "react";

interface StaleBannerProps {
  jobs: Job[];
}

export default function StaleBanner({ jobs }: StaleBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Count stale jobs
  const staleJobs = jobs.filter(job => {
    if (["OFFER", "REJECTED", "WITHDRAWN"].includes(job.status)) return false;
    const lastActivity = new Date(job.updatedAt || job.appliedDate);
    const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    return job.status === "APPLIED" && daysSince >= 14;
  });

  if (staleJobs.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-[#FEF9EE] border border-[#F5DFA0] rounded-xl px-4 py-3 mb-5"
      style={{ animation: "fadeSlideDown 0.4s ease both" }}>
      <Flame size={16} className="text-[#92681A] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#92681A]">
          {staleJobs.length} application{staleJobs.length !== 1 ? "s" : ""} may be going cold
        </p>
        <p className="text-xs text-[#92681A] opacity-80 mt-0.5">
          {staleJobs.slice(0, 3).map(j => j.company).join(", ")}
          {staleJobs.length > 3 ? ` and ${staleJobs.length - 3} more` : ""} — no response in 14+ days.
          Click the 🔥 on any card to send a follow-up.
        </p>
      </div>
      <button onClick={() => setDismissed(true)}
        className="p-1 text-[#92681A] hover:bg-[#F5DFA0] rounded-lg transition-colors shrink-0"
        aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
