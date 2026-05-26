"use client";

import { useState } from "react";
import { Job, JobStatus, STATUS_CONFIG } from "@/types";
import JobCard from "./JobCard";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onAddJob: (status: JobStatus) => void;
  onRoundChange?: (jobId: string, round: string | null) => void;
}

const COLUMNS: JobStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
];

const COLUMN_DOTS: Record<JobStatus, string> = {
  APPLIED: "#6B9E78",
  SCREENING: "#92681A",
  INTERVIEWING: "#7C6FA0",
  OFFER: "#2D7A5A",
  REJECTED: "#9B3D38",
  WITHDRAWN: "#6B7280",
};

export default function KanbanBoard({
  jobs,
  onEdit,
  onDelete,
  onStatusChange,
  onAddJob,
  onRoundChange,
}: KanbanBoardProps) {
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

  const getJobsByStatus = (status: JobStatus) =>
    jobs.filter((j) => j.status === status);

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    if (draggedJobId) {
      onStatusChange(draggedJobId, status);
    }
    setDraggedJobId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
    setDragOverColumn(null);
  };

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-220px)]"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      {COLUMNS.map((status) => {
        const config = STATUS_CONFIG[status];
        const columnJobs = getJobsByStatus(status);
        const isDragOver = dragOverColumn === status;
        const dotColor = COLUMN_DOTS[status];

        return (
          <div
            key={status}
            className="shrink-0 w-[272px]"
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
            onDragLeave={() => setDragOverColumn(null)}
            aria-label={`${config.label} column`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-sm font-medium text-[#1C1C1E]">
                  {config.label}
                </span>
                {/* Count badge */}
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                    config.bg,
                    config.color
                  )}
                >
                  {columnJobs.length}
                </span>
              </div>
              <button
                onClick={() => onAddJob(status)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#6B9E78] hover:bg-[#EEF4F0] transition-all"
                aria-label={`Add job to ${config.label}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              role="list"
              aria-label={`${config.label} column, ${columnJobs.length} jobs`}
              className={cn(
                "space-y-3 min-h-[120px] rounded-xl p-2 transition-all duration-200",
                isDragOver
                  ? "border-2 border-dashed border-[#6B9E78] bg-[#EEF4F0]"
                  : "border-2 border-transparent bg-[#FAFAF8]"
              )}
            >
              {columnJobs.map((job, index) => (
                <div
                  key={job.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, job.id)}
                  onDragEnd={handleDragEnd}
                  role="listitem"
                  aria-label={`${job.role} at ${job.company}, status: ${STATUS_CONFIG[status].label}. Press Enter to edit, Delete to remove.`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    // Arrow keys to move between columns
                    const cols = COLUMNS;
                    const currentIdx = cols.indexOf(status);
                    if (e.key === "ArrowRight" && currentIdx < cols.length - 1) {
                      e.preventDefault();
                      onStatusChange(job.id, cols[currentIdx + 1]);
                    }
                    if (e.key === "ArrowLeft" && currentIdx > 0) {
                      e.preventDefault();
                      onStatusChange(job.id, cols[currentIdx - 1]);
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onEdit(job);
                    }
                    if (e.key === "Delete" || e.key === "Backspace") {
                      e.preventDefault();
                      onDelete(job.id);
                    }
                  }}
                  className={cn(
                    "transition-all duration-200 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#6B9E78] focus-visible:outline-offset-2 rounded-xl",
                    draggedJobId === job.id ? "opacity-40 scale-95" : "opacity-100"
                  )}
                  style={{ animation: `cardEnter 0.25s ease ${index * 30}ms both` }}
                >
                  <JobCard job={job} onEdit={onEdit} onDelete={onDelete} onRoundChange={onRoundChange} />
                </div>
              ))}

              {/* Empty state */}
              {columnJobs.length === 0 && !isDragOver && (
                <button
                  onClick={() => onAddJob(status)}
                  className="w-full flex flex-col items-center justify-center py-10 text-[#6B7280] border-2 border-dashed border-[#E8E8E4] rounded-xl hover:border-[#6B9E78] hover:text-[#6B9E78] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border border-dashed border-current flex items-center justify-center mb-2">
                    <Plus size={14} />
                  </div>
                  <p className="text-xs">Add job</p>
                </button>
              )}

              {isDragOver && (
                <div className="flex items-center justify-center py-6 text-[#6B9E78] text-sm font-medium">
                  Drop to move here
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
