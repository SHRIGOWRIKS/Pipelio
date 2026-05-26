"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Job, JobStatus, STATUS_CONFIG } from "@/types";
import KanbanBoard from "@/components/jobs/KanbanBoard";
import JobForm from "@/components/jobs/JobForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  List,
  Briefcase,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import JobListView from "@/components/jobs/JobListView";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import GmailSuggestions from "@/components/gmail/GmailSuggestions";
import StaleBanner from "@/components/jobs/StaleBanner";
import DebriefModal from "@/components/jobs/DebriefModal";
import KeyboardShortcutsHint from "@/components/ui/KeyboardShortcutsHint";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const highlightStatus = searchParams.get("status") as JobStatus | null;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">(
    (highlightStatus as JobStatus) || "ALL"
  );
  const [profile, setProfile] = useState<{ currentRole?: string | null; jobSearchStatus?: string | null; targetRoles?: string | null } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<JobStatus>("APPLIED");
  const [submitting, setSubmitting] = useState(false);
  const [debriefJob, setDebriefJob] = useState<Job | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Keyboard shortcuts
  const searchRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts({
    onNewJob: () => handleAddJob(),
    onSearch: () => searchRef.current?.focus(),
    onEscape: () => { setModalOpen(false); setEditingJob(null); setDebriefJob(null); },
  });

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // Fetch profile once
  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => setProfile(d))
      .catch(() => {});
  }, []);

  // Listen for refresh events from Gmail suggestions
  useEffect(() => {
    const refreshHandler = () => {
      setLoading(true);
      fetchJobs();
    };
    const filterHandler = (e: Event) => {
      const status = (e as CustomEvent).detail?.status as JobStatus;
      if (status) {
        setStatusFilter(status);
        setView("kanban");
        // Scroll to board smoothly
        setTimeout(() => {
          document.getElementById("kanban-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    };
    window.addEventListener("pipelio:refresh", refreshHandler);
    window.addEventListener("pipelio:filter", filterHandler);
    return () => {
      window.removeEventListener("pipelio:refresh", refreshHandler);
      window.removeEventListener("pipelio:filter", filterHandler);
    };
  }, [fetchJobs]);

  // Quick stats
  const stats = {
    total: jobs.length,
    interviewing: jobs.filter((j) => j.status === "INTERVIEWING").length,
    offers: jobs.filter((j) => j.status === "OFFER").length,
    responseRate:
      jobs.length > 0
        ? Math.round(
            (jobs.filter((j) =>
              ["SCREENING", "INTERVIEWING", "OFFER", "REJECTED"].includes(
                j.status
              )
            ).length /
              jobs.length) *
              100
          )
        : 0,
  };

  const handleAddJob = (status: JobStatus = "APPLIED") => {
    setEditingJob(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job application?")) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      addToast("Application deleted", "info");
    }
  };

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      const label = STATUS_CONFIG[status].label;
      if (status === "OFFER") {
        addToast(`🎉 Offer received! Congrats!`, "success");
      } else {
        addToast(`Moved to ${label}`, "info");
      }
      // Auto-trigger debrief when moving to interview stages
      if (status === "INTERVIEWING" || status === "SCREENING") {
        setTimeout(() => setDebriefJob(updated), 600);
      }
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      if (editingJob) {
        const res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const updated = await res.json();
          setJobs((prev) =>
            prev.map((j) => (j.id === editingJob.id ? updated : j))
          );
          addToast("Application updated!", "success");
        }
      } else {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status: defaultStatus }),
        });
        if (res.ok) {
          const created = await res.json();
          setJobs((prev) => [created, ...prev]);
          addToast("Application added!", "success");
        }
      }
      setModalOpen(false);
      setEditingJob(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoundChange = async (jobId: string, round: string | null) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewRound: round }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
      if (round) {
        const { getRoundLabel } = await import("@/lib/interview-rounds");
        addToast(`Round updated: ${getRoundLabel(round)}`, "info");
      }
    }
  };

  const handleExport = async () => {
    const res = await fetch("/api/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pipelio-jobs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("CSV exported!", "success");
    }
  };

  // Stat cards with colored left border (no gradients)
  const statCards = [
    {
      label: "Total",
      value: stats.total,
      suffix: "",
      icon: Briefcase,
      color: "text-[#6B9E78]",
      bg: "bg-white",
      borderLeft: "border-l-[#6B9E78]",
    },
    {
      label: "Interviewing",
      value: stats.interviewing,
      suffix: "",
      icon: Target,
      color: "text-[#7C6FA0]",
      bg: "bg-white",
      borderLeft: "border-l-[#7C6FA0]",
    },
    {
      label: "Offers",
      value: stats.offers,
      suffix: "",
      icon: Award,
      color: "text-[#2D7A5A]",
      bg: "bg-white",
      borderLeft: "border-l-[#2D7A5A]",
    },
    {
      label: "Response Rate",
      value: stats.responseRate,
      suffix: "%",
      icon: TrendingUp,
      color: "text-[#92681A]",
      bg: "bg-white",
      borderLeft: "border-l-[#92681A]",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6" style={{ animation: "fadeSlideDown 0.4s ease both" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">
              Job Board
            </h1>
            <p className="text-[#6B7280] text-sm mt-0.5">
              {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
              {profile?.targetRoles && (
                <span className="ml-2 text-[#6B9E78] font-medium">
                  · Looking for {profile.targetRoles.split(",")[0].trim()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download size={14} />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => handleAddJob()}>
              <Plus size={14} />
              Add Job
            </Button>
          </div>
        </div>

        {/* Stat cards — white bg, colored left border, no gradients */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {statCards.map(
            ({ label, value, suffix, icon: Icon, color, bg, borderLeft }, i) => (
              <div
                key={label}
                className={`${bg} border border-[#E8E8E4] border-l-4 ${borderLeft} rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm`}
                style={{ animation: `fadeSlideUp 0.35s ease ${i * 50}ms both` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    {label}
                  </span>
                  <Icon size={14} className={color} />
                </div>
                <p className={`text-2xl font-semibold ${color}`}>
                  <AnimatedCounter value={value} suffix={suffix} />
                </p>
              </div>
            )
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              />
              <Input
                ref={searchRef}
                placeholder="Search company or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-[#E8E8E4]"
              />
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-[#F5F5F1] rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setView("kanban")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === "kanban"
                    ? "bg-white text-[#6B9E78] shadow-sm"
                    : "text-[#6B7280] hover:text-[#1C1C1E]"
                }`}
                aria-label="Kanban view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  view === "list"
                    ? "bg-white text-[#6B9E78] shadow-sm"
                    : "text-[#6B7280] hover:text-[#1C1C1E]"
                }`}
                aria-label="List view"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["ALL", "APPLIED", "SCREENING", "INTERVIEWING", "OFFER", "REJECTED"] as const).map((s) => {
              const isAll = s === "ALL";
              const conf = isAll ? null : STATUS_CONFIG[s];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? isAll
                        ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                        : `${conf?.bg} ${conf?.color} ${conf?.border}`
                      : "bg-white text-[#6B7280] border-[#E8E8E4] hover:border-[#C8C8C4]"
                  }`}
                >
                  {isAll ? "All" : conf?.label}
                  {!isAll && (
                    <span className="ml-1 opacity-60">
                      {jobs.filter(j => j.status === s).length}
                    </span>
                  )}
                </button>
              );
            })}
            {statusFilter !== "ALL" && (
              <button
                onClick={() => setStatusFilter("ALL")}
                className="text-xs text-[#6B7280] hover:text-[#1C1C1E] underline ml-1"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gmail suggestions */}
      <GmailSuggestions />

      {/* Stale applications banner */}
      {!loading && <StaleBanner jobs={jobs} />}

      {/* Content */}
      {loading ? (        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#E8E8E4] border-t-[#6B9E78] animate-spin" role="status" aria-label="Loading" />
          <p className="text-sm text-[#6B7280]">Loading your applications...</p>
        </div>
      ) : jobs.length === 0 && !search ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          style={{ animation: "fadeSlideUp 0.4s ease both" }}
        >
          <div className="w-16 h-16 bg-[#EEF4F0] rounded-xl flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-[#6B9E78]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">
            No applications yet
          </h3>
          <p className="text-[#6B7280] text-sm mb-6 max-w-xs">
            Add your first job application and start tracking your search.
          </p>
          <Button onClick={() => handleAddJob()}>
            <Plus size={14} />
            Add your first job
          </Button>
        </div>
      ) : view === "kanban" ? (
        <div id="kanban-board">
          <KanbanBoard
            jobs={jobs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddJob={handleAddJob}
            onRoundChange={handleRoundChange}
          />
        </div>
      ) : (
        <JobListView
          jobs={jobs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingJob(null);
        }}
        title={editingJob ? "Edit Application" : "Add Job Application"}
        size="lg"
      >
        <JobForm
          job={editingJob || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingJob(null);
          }}
          loading={submitting}
        />
      </Modal>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Keyboard shortcuts hint */}
      <KeyboardShortcutsHint />

      {/* Post-interview debrief modal */}
      {debriefJob && (
        <DebriefModal
          jobId={debriefJob.id}
          jobRole={debriefJob.role}
          jobCompany={debriefJob.company}
          onClose={() => setDebriefJob(null)}
          onSaved={() => {
            addToast("Interview debrief saved! 📝", "success");
            setDebriefJob(null);
          }}
        />
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
