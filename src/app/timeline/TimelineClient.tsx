"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Job, Timeline, STATUS_CONFIG } from "@/types";
import { Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  jobId: string;
  event: string;
  note?: string | null;
  date: string;
  jobRole: string;
  jobCompany: string;
  jobStatus: string;
}

function getRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGroupLabel(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This Week";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

export default function TimelineClient() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((jobs: Job[]) => {
        const allEvents: TimelineEvent[] = [];
        jobs.forEach((job) => {
          if (job.timeline) {
            job.timeline.forEach((t: Timeline) => {
              allEvents.push({
                id: t.id,
                jobId: job.id,
                event: t.event,
                note: t.note,
                date: String(t.date),
                jobRole: job.role,
                jobCompany: job.company,
                jobStatus: job.status,
              });
            });
          }
        });
        // Sort newest first
        allEvents.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(allEvents);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8E8E4] border-t-[#6B9E78] animate-spin" role="status" aria-label="Loading" />
        <p className="text-sm text-[#6B7280]">Loading timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">
            Timeline
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            All events across your applications
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-[#EEF4F0] rounded-xl flex items-center justify-center mb-4">
            <Clock size={24} className="text-[#6B9E78]" />
          </div>
          <h3 className="text-base font-semibold text-[#1C1C1E] mb-2">
            No events yet
          </h3>
          <p className="text-sm text-[#6B7280] max-w-xs">
            Add job applications to start seeing your timeline here.
          </p>
        </div>
      </div>
    );
  }

  // Group events
  const grouped: Record<string, TimelineEvent[]> = {};
  events.forEach((e) => {
    const label = getGroupLabel(e.date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(e);
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">
          Timeline
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""} across all applications
        </p>
      </div>

      {/* Timeline groups */}
      <div className="space-y-8">
        {GROUP_ORDER.filter((g) => grouped[g]).map((group) => (
          <div key={group}>
            <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
              {group}
            </h2>

            {/* Vertical timeline */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-3 top-0 bottom-0 w-px" style={{ backgroundColor: "var(--border)" }} />

              <div className="space-y-1">
                {grouped[group].map((event, i) => {
                  const config =
                    STATUS_CONFIG[event.jobStatus as keyof typeof STATUS_CONFIG];
                  const dotColor = config?.dot || "bg-[#9CA3AF]";

                  return (
                    <button
                      key={event.id}
                      onClick={() => router.push(`/jobs/${event.jobId}`)}
                      className="w-full flex items-start gap-4 pl-0 pr-2 py-3 rounded-xl hover:bg-[#F5F5F1] hover:border hover:border-[#E8E8E4] transition-all text-left group"
                      style={{
                        animation: `fadeUp 0.3s ease ${i * 30}ms both`,
                      }}
                    >
                      {/* Dot */}
                      <div className="relative z-10 shrink-0 mt-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                          style={{
                            backgroundColor: "var(--bg-base)",
                            borderColor: "var(--bg-base)",
                          }}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1C1C1E] group-hover:text-[#6B9E78] transition-colors">
                              {event.event}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                              {event.jobRole} · {event.jobCompany}
                            </p>
                            {event.note && (
                              <p className="text-xs text-[#6B7280] mt-1 line-clamp-1">
                                {event.note}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-[#6B7280] shrink-0 mt-0.5">
                            {getRelativeTime(event.date)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
