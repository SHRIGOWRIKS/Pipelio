"use client";

import { Job, STATUS_CONFIG } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import {
  MapPin, DollarSign, ExternalLink, Calendar,
  MoreVertical, Pencil, Trash2, Clock, Star,
  Flame, AlertTriangle, Mail, Loader2, Copy, CheckCircle, X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import RoundBadge from "./RoundBadge";

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onRoundChange?: (jobId: string, round: string | null) => void;
}

// ── Ghosting logic ────────────────────────────────────────────────────────────
function getGhostingStatus(job: Job): "hot" | "warm" | null {
  // Only flag active (non-terminal) statuses
  if (["OFFER", "REJECTED", "WITHDRAWN"].includes(job.status)) return null;

  const lastActivity = new Date(job.updatedAt || job.appliedDate);
  const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (job.status === "APPLIED" && daysSince >= 14) return "hot";   // 🔥 14+ days in Applied
  if (daysSince >= 21) return "warm";                               // ⚠️ 21+ days any status
  return null;
}

// ── Follow-up modal ───────────────────────────────────────────────────────────
function FollowUpModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string; tip: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  useEffect(() => {
    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          role: job.role,
          appliedDate: job.appliedDate,
          location: job.location,
          jobUrl: job.jobUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || "Failed to generate. Try again.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, field: "subject" | "body") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const daysSince = Math.floor(
    (Date.now() - new Date(job.appliedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ animation: "modalEnter 0.25s ease both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E4]">
          <div>
            <h2 className="font-semibold text-[#1C1C1E] text-base flex items-center gap-2">
              <Mail size={16} className="text-[#6B9E78]" />
              Follow-up Email
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {job.role} at {job.company} · {daysSince} days ago
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F5F5F1] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 size={24} className="animate-spin text-[#6B9E78]" />
              <p className="text-sm text-[#6B7280]">Writing your follow-up email...</p>
            </div>
          )}

          {error && (
            <div className="bg-[#FDF0EF] border border-[#F5C6C3] rounded-xl px-4 py-3 text-sm text-[#9B3D38]">
              {error}
              <button onClick={generate} className="ml-2 underline font-medium">Try again</button>
            </div>
          )}

          {result && (
            <>
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Subject</label>
                  <button onClick={() => copy(result.subject, "subject")}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#6B9E78] transition-colors">
                    {copied === "subject" ? <><CheckCircle size={11} className="text-[#6B9E78]" />Copied!</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <div className="bg-[#F5F5F1] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1E] font-medium">
                  {result.subject}
                </div>
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Email Body</label>
                  <button onClick={() => copy(result.body, "body")}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#6B9E78] transition-colors">
                    {copied === "body" ? <><CheckCircle size={11} className="text-[#6B9E78]" />Copied!</> : <><Copy size={11} />Copy</>}
                  </button>
                </div>
                <div className="bg-[#FAFAF8] border border-[#E8E8E4] rounded-lg px-4 py-3 text-sm text-[#1C1C1E] leading-relaxed whitespace-pre-wrap">
                  {result.body}
                </div>
              </div>

              {/* Tip */}
              {result.tip && (
                <div className="flex items-start gap-2 bg-[#EEF4F0] border border-[#C8DDD0] rounded-lg px-3 py-2.5">
                  <span className="text-[#6B9E78] font-bold text-sm shrink-0">💡</span>
                  <p className="text-xs text-[#4A7C59] leading-relaxed">{result.tip}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={generate}
                  className="flex items-center gap-1.5 text-xs text-[#6B7280] border border-[#E8E8E4] px-3 py-2 rounded-lg hover:bg-[#F5F5F1] transition-colors">
                  <Loader2 size={11} />
                  Regenerate
                </button>
                <button onClick={() => copy(result.subject + "\n\n" + result.body, "body")}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#6B9E78] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#5A8A67] transition-colors">
                  <Copy size={11} />
                  Copy Full Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Main JobCard ──────────────────────────────────────────────────────────────
export default function JobCard({ job, onEdit, onDelete, onRoundChange }: JobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isDeadlineSoon =
    job.deadline &&
    new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
    new Date(job.deadline).getTime() > Date.now();

  const ghosting = getGhostingStatus(job);
  const config = STATUS_CONFIG[job.status];

  // Days since last activity
  const daysSince = Math.floor(
    (Date.now() - new Date(job.updatedAt || job.appliedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <div className={`bg-white rounded-xl border p-4 hover:shadow-sm hover:-translate-y-px transition-all duration-200 group ${
        ghosting === "hot"
          ? "border-[#E8A598] bg-[#FFFAF9]"
          : ghosting === "warm"
          ? "border-[#F5DFA0] bg-[#FFFEF5]"
          : "border-[#E8E8E4]"
      }`}>

        {/* Ghosting banner */}
        {ghosting && (
          <div className={`flex items-center justify-between gap-2 mb-3 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            ghosting === "hot"
              ? "bg-[#FDF0EF] text-[#9B3D38]"
              : "bg-[#FEF9EE] text-[#92681A]"
          }`}>
            <div className="flex items-center gap-1.5">
              {ghosting === "hot"
                ? <Flame size={12} className="shrink-0" />
                : <AlertTriangle size={12} className="shrink-0" />}
              <span>
                {ghosting === "hot"
                  ? `No response in ${daysSince} days`
                  : `Inactive for ${daysSince} days`}
              </span>
            </div>
            <button
              onClick={() => setShowFollowUp(true)}
              className={`flex items-center gap-1 text-xs font-semibold underline underline-offset-2 hover:no-underline transition-all ${
                ghosting === "hot" ? "text-[#9B3D38]" : "text-[#92681A]"
              }`}
            >
              <Mail size={10} />
              Follow up
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="font-semibold text-[#1C1C1E] hover:text-[#6B9E78] transition-colors line-clamp-1 text-sm"
            >
              {job.role}
            </Link>
            <p className="text-sm text-[#6B7280] mt-0.5 truncate">{job.company}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setStarred(!starred)}
              className={`p-1 rounded-md transition-all ${
                starred ? "text-[#E8A598]" : "text-[#E8E8E4] opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Star job"
            >
              <Star size={13} fill={starred ? "currentColor" : "none"} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-md text-[#6B7280] hover:text-[#1C1C1E] hover:bg-[#F5F5F1] opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Job options"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 bg-white border border-[#E8E8E4] rounded-xl shadow-sm z-20 min-w-[160px] py-1 overflow-hidden">
                  <button
                    onClick={() => { onEdit(job); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F1] transition-colors"
                  >
                    <Pencil size={13} />Edit
                  </button>
                  <button
                    onClick={() => { setShowFollowUp(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F5F5F1] transition-colors"
                  >
                    <Mail size={13} />Follow-up email
                  </button>
                  <button
                    onClick={() => { onDelete(job.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#9B3D38] hover:bg-[#FDF0EF] transition-colors"
                  >
                    <Trash2 size={13} />Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-3">
          {job.location && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <MapPin size={11} /><span className="truncate">{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <DollarSign size={11} /><span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Calendar size={11} /><span>{formatRelativeDate(job.appliedDate)}</span>
          </div>
          {isDeadlineSoon && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#E8A598" }}>
              <Clock size={11} /><span>Deadline soon</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F1]">
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border} border w-fit`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
            {(job.status === "INTERVIEWING" || job.status === "SCREENING") && onRoundChange && (
              <RoundBadge
                jobId={job.id}
                currentRound={job.interviewRound}
                onRoundChange={onRoundChange}
                compact
              />
            )}
          </div>
          {job.jobUrl && (
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
              className="text-[#6B7280] hover:text-[#6B9E78] transition-colors shrink-0" aria-label="Open job posting">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Follow-up modal */}
      {showFollowUp && (
        <FollowUpModal job={job} onClose={() => setShowFollowUp(false)} />
      )}
    </>
  );
}
