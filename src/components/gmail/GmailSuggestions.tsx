"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, RefreshCw, CheckCircle, X, ChevronDown,
  ChevronUp, AlertCircle, Zap, Plus, ArrowRight,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { STATUS_CONFIG, JobStatus } from "@/types";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

interface Suggestion {
  id: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  detectedType: string;
  suggestedStatus: string | null;
  confidence: number;
  snippet: string | null;
  job: { id: string; company: string; role: string; status: string } | null;
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  INTERVIEW: { label: "Interview invite",  emoji: "🎯", color: "text-[#1C1C1E]",    bg: "bg-[#F5F5F1]"    },
  REJECTION: { label: "Rejection",         emoji: "😔", color: "text-rose-700",    bg: "bg-rose-50"    },
  OFFER:     { label: "Offer received!",   emoji: "🎉", color: "text-emerald-700", bg: "bg-emerald-50" },
  FOLLOWUP:  { label: "Applied",           emoji: "📬", color: "text-amber-700",   bg: "bg-amber-50"   },
};

// Extract company name from email subject/from
function extractCompany(subject: string, from: string): string {
  // Try "at CompanyName" pattern
  const atMatch = subject.match(/\bat\s+([A-Z][^,.\n]+?)(?:\s*[,.\n]|$)/i);
  if (atMatch) return atMatch[1].trim();

  // Try "for CompanyName" pattern
  const forMatch = subject.match(/\bfor\s+(?:the\s+)?(?:\w+\s+){0,3}(?:at|@)\s+([A-Z][^,.\n]+?)(?:\s*[,.\n]|$)/i);
  if (forMatch) return forMatch[1].trim();

  // Try sender domain
  const domainMatch = from.match(/@([a-zA-Z0-9-]+)\./);
  if (domainMatch) {
    const domain = domainMatch[1];
    if (!["gmail", "yahoo", "outlook", "hotmail", "noreply", "donotreply", "workflow", "mail"].includes(domain)) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }

  return "";
}

// Extract role from email subject
function extractRole(subject: string): string {
  const patterns = [
    /(?:for|position:|role:)\s+(?:the\s+)?([A-Z][^,.\n@]+?)(?:\s+(?:at|position|role|job)|[,.\n]|$)/i,
    /(?:application|applying)\s+(?:for\s+)?(?:the\s+)?([A-Z][^,.\n@]+?)(?:\s+(?:at|position)|[,.\n]|$)/i,
  ];
  for (const p of patterns) {
    const m = subject.match(p);
    if (m && m[1].length < 60) return m[1].trim();
  }
  return "Software Engineer";
}

export default function GmailSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/sync");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setGmailConnected(data.gmailConnected);
        setLastSync(data.lastSync);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const sync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncMsg(data.error || "Sync failed");
      } else {
        setSyncMsg(data.synced > 0 ? `Found ${data.synced} new email${data.synced !== 1 ? "s" : ""}` : "No new emails");
        await fetchSuggestions();
      }
    } catch {
      setSyncMsg("Network error");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 4000);
    }
  };

  // Accept: move existing job to new status
  const handleAccept = async (s: Suggestion, forceStatus?: string) => {
    if (!s.job) return;
    setActing(s.id);
    try {
      const status = forceStatus || s.suggestedStatus;
      // First update the job status directly
      const jobRes = await fetch(`/api/jobs/${s.job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!jobRes.ok) {
        const errText = await jobRes.text();
        console.error("Job update failed:", jobRes.status, errText);
        setActing(null);
        return;
      }

      // Then mark suggestion as accepted
      await fetch(`/api/gmail/suggestions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", jobId: s.job.id, overrideStatus: status }),
      });

      // Remove from list and refresh kanban
      setSuggestions(prev => prev.filter(x => x.id !== s.id));
      window.dispatchEvent(new CustomEvent("pipelio:refresh"));
      addToast(`Moved to ${forceStatus === "REJECTED" ? "Rejected" : forceStatus === "OFFER" ? "Offer 🎉" : "Screening"}`, "success");
    } catch (err) {
      console.error("handleAccept error:", err);
      addToast("Something went wrong. Try again.", "error");
    }
    setActing(null);
  };

  // Add to pipeline: create new job card from email
  const handleAddToPipeline = async (s: Suggestion, forceStatus?: string) => {
    setActing(s.id);
    const company = extractCompany(s.emailSubject, s.emailFrom);
    const role    = extractRole(s.emailSubject);
    const status  = forceStatus || s.suggestedStatus || "APPLIED";

    try {
      // Parse date safely
      let appliedDate: string;
      try {
        const parsed = new Date(s.emailDate);
        appliedDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      } catch {
        appliedDate = new Date().toISOString();
      }

      // Create the job
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company || "Unknown Company",
          role,
          status,
          appliedDate,
        }),
      });

      if (!jobRes.ok) {
        const errText = await jobRes.text();
        console.error("Job create failed:", jobRes.status, errText);
        setActing(null);
        return;
      }

      const newJob = await jobRes.json();

      // Mark suggestion as accepted
      await fetch(`/api/gmail/suggestions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", jobId: newJob.id, overrideStatus: status }),
      });

      // Remove from list and refresh kanban
      setSuggestions(prev => prev.filter(x => x.id !== s.id));
      window.dispatchEvent(new CustomEvent("pipelio:refresh"));
      const label = status === "REJECTED" ? "Rejected ✓" : status === "APPLIED" ? "Applied ✓" : `${status} ✓`;
      addToast(`Added to ${label}`, "success");
    } catch (err) {
      console.error("handleAddToPipeline error:", err);
      addToast("Something went wrong. Try again.", "error");
    }
    setActing(null);
  };

  const handleDismiss = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/gmail/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (res.ok) setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch { /* silent */ }
    setActing(null);
  };

  if (!loading && !gmailConnected && suggestions.length === 0) return null;
  if (loading) return null;

  // Group by type for summary
  const counts = suggestions.reduce((acc, s) => {
    acc[s.detectedType] = (acc[s.detectedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E8E8E4] mb-6 overflow-hidden"
        role="region"
        aria-label="Gmail email suggestions"
        aria-live="polite"
        aria-atomic="false"
      >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F0EC]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#EEF4F0] rounded-lg flex items-center justify-center">
            <Mail size={14} className="text-[#6B9E78]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1C1C1E]">Gmail Suggestions</span>
            {suggestions.length > 0 && (
              <span className="bg-[#6B9E78] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            )}
            {/* Type summary pills */}
            {Object.entries(counts).map(([type, count]) => {
              const conf = TYPE_CONFIG[type];
              if (!conf) return null;
              return (
                <span key={type} className={`hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${conf.bg} ${conf.color}`}>
                  {conf.emoji} {count} {conf.label}
                </span>
              );
            })}
          </div>
          {lastSync && (
            <span className="text-xs text-[#9CA3AF] hidden lg:block">
              · synced {formatRelativeDate(lastSync)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {syncMsg && <span className="text-xs text-[#6B7280] hidden sm:block">{syncMsg}</span>}
          <button onClick={sync} disabled={syncing}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1C1C1E] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors disabled:opacity-50">
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          {!gmailConnected ? (
            <div className="px-5 py-4 flex items-center gap-3">
              <AlertCircle size={15} className="text-[#E8A598] shrink-0" />
              <p className="text-sm text-[#6B7280]">
                Gmail access expired.{" "}
                <a href="/api/auth/signin" className="text-[#6B9E78] font-medium hover:underline">
                  Sign out and sign in again
                </a>{" "}
                to reconnect.
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-5 py-4 flex items-center gap-3 text-sm text-[#9CA3AF]">
              <CheckCircle size={14} className="text-[#6B9E78]" />
              No pending suggestions. Click Sync to check for new emails.
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F1]">
              {suggestions.map(s => {
                const typeConf   = TYPE_CONFIG[s.detectedType] || TYPE_CONFIG.FOLLOWUP;
                const isExpanded = expanded === s.id;
                const isActing   = acting === s.id;
                const statusConf = s.suggestedStatus ? STATUS_CONFIG[s.suggestedStatus as JobStatus] : null;
                const company    = s.job?.company || extractCompany(s.emailSubject, s.emailFrom);
                const role       = s.job?.role || extractRole(s.emailSubject);

                return (
                  <div key={s.id} className="px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Type badge */}
                      <span className={`shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConf.bg} ${typeConf.color}`}>
                        {typeConf.emoji} {typeConf.label}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Email subject */}
                        <p className="text-sm font-medium text-[#1C1C1E] truncate">{s.emailSubject}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">
                          {s.emailFrom.replace(/<.*>/, "").trim()} · {formatRelativeDate(s.emailDate)}
                        </p>

                        {/* Detected job info */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {company && (
                            <span className="text-xs font-semibold text-[#1C1C1E] bg-[#F5F5F1] px-2 py-0.5 rounded-md">
                              {company}
                            </span>
                          )}
                          {role && role !== "Software Engineer" && (
                            <span className="text-xs text-[#6B7280]">{role}</span>
                          )}
                          {s.job && (
                            <span className="text-xs text-[#6B9E78] font-medium">· matched in pipeline</span>
                          )}
                        </div>

                        {/* Snippet */}
                        {s.snippet && (
                          <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                            className="text-xs text-[#6B9E78] hover:underline mt-1">
                            {isExpanded ? "Hide preview ↑" : "Show preview ↓"}
                          </button>
                        )}
                        {isExpanded && s.snippet && (
                          <div className="mt-2 bg-[#F5F5F1] rounded-lg px-3 py-2 text-xs text-[#6B7280] leading-relaxed italic">
                            &ldquo;{s.snippet}&rdquo;
                          </div>
                        )}

                        {/* ── Action buttons ── */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">

                          {/* REJECTION — move existing job to Rejected */}
                          {s.detectedType === "REJECTION" && s.job && (
                            <button onClick={() => handleAccept(s, "REJECTED")} disabled={isActing}
                              className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50">
                              <CheckCircle size={12} />
                              {isActing ? "Moving..." : "Move to Rejected"}
                            </button>
                          )}

                          {/* REJECTION — no matched job, add as rejected */}
                          {s.detectedType === "REJECTION" && !s.job && (
                            <button onClick={() => handleAddToPipeline(s, "REJECTED")} disabled={isActing}
                              className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50">
                              <Plus size={12} />
                              {isActing ? "Adding..." : "Add as Rejected"}
                            </button>
                          )}

                          {/* OFFER — move to Offer */}
                          {s.detectedType === "OFFER" && s.job && (
                            <button onClick={() => handleAccept(s, "OFFER")} disabled={isActing}
                              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                              <CheckCircle size={12} />
                              {isActing ? "Moving..." : "Move to Offer 🎉"}
                            </button>
                          )}

                          {/* INTERVIEW — move to Screening/Interviewing */}
                          {s.detectedType === "INTERVIEW" && s.job && (
                            <button onClick={() => handleAccept(s, "SCREENING")} disabled={isActing}
                              className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ background: "#3b82f6" }}>
                              <CheckCircle size={12} />
                              {isActing ? "Moving..." : "Move to Screening"}
                            </button>
                          )}

                          {/* INTERVIEW — not in pipeline, add as Screening */}
                          {s.detectedType === "INTERVIEW" && !s.job && (
                            <button onClick={() => handleAddToPipeline(s, "SCREENING")} disabled={isActing}
                              className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ background: "#3b82f6" }}>
                              <Plus size={12} />
                              {isActing ? "Adding..." : "Add as Screening"}
                            </button>
                          )}

                          {/* FOLLOWUP — add to Applied if not in pipeline */}
                          {s.detectedType === "FOLLOWUP" && !s.job && (
                            <button onClick={() => handleAddToPipeline(s, "APPLIED")} disabled={isActing}
                              className="flex items-center gap-1.5 bg-[#6B9E78] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#5A8A67] transition-colors disabled:opacity-50">
                              <Plus size={12} />
                              {isActing ? "Adding..." : "Add to Applied"}
                            </button>
                          )}

                          {/* FOLLOWUP — already in pipeline */}
                          {s.detectedType === "FOLLOWUP" && s.job && (
                            <span className="text-xs text-[#6B9E78] font-medium flex items-center gap-1">
                              <CheckCircle size={11} /> Already in pipeline
                            </span>
                          )}

                          {/* View in board — always show */}
                          <button
                            onClick={() => {
                              const status = s.suggestedStatus || "APPLIED";
                              window.dispatchEvent(new CustomEvent("pipelio:filter", { detail: { status } }));
                            }}
                            className="flex items-center gap-1.5 text-xs text-[#6B7280] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors"
                          >
                            View in Board
                            <ArrowRight size={11} />
                          </button>

                          {/* Dismiss */}
                          <button onClick={() => handleDismiss(s.id)} disabled={isActing}
                            className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] px-2 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors">
                            <X size={12} />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer — bulk actions */}
          {suggestions.length > 1 && (
            <div className="px-5 py-3 border-t border-[#F0F0EC] flex items-center justify-between bg-[#FAFAF8]">
              <span className="text-xs text-[#9CA3AF]">{suggestions.length} suggestions pending</span>
              <button
                onClick={async () => {
                  const ids = suggestions.map(s => s.id);
                  // Dismiss all in parallel
                  await Promise.all(
                    ids.map(id =>
                      fetch(`/api/gmail/suggestions/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "dismiss" }),
                      })
                    )
                  );
                  setSuggestions([]);
                  addToast(`Dismissed ${ids.length} suggestion${ids.length !== 1 ? "s" : ""}`, "info");
                }}
                className="text-xs font-medium text-[#9CA3AF] hover:text-[#6B7280] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors"
              >
                Dismiss all ({suggestions.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
    <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
