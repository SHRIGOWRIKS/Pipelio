"use client";

import { Job, JobStatus, STATUS_CONFIG } from "@/types";
import Badge from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils";
import { MapPin, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface JobListViewProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

export default function JobListView({
  jobs,
  onEdit,
  onDelete,
  onStatusChange,
}: JobListViewProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-20 text-[#6B7280]">
        <p className="text-lg font-medium">No jobs found</p>
        <p className="text-sm mt-1">Add your first job application to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E8E8E4] bg-[#FAFAF8]">
            <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Role</th>
            <th className="text-left px-4 py-3 font-medium text-[#6B7280] hidden sm:table-cell">Company</th>
            <th className="text-left px-4 py-3 font-medium text-[#6B7280] hidden md:table-cell">Location</th>
            <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-[#6B7280] hidden lg:table-cell">Applied</th>
            <th className="text-right px-4 py-3 font-medium text-[#6B7280]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-[#FAFAF8] transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-medium text-[#1C1C1E] hover:text-[#6B9E78] transition-colors"
                >
                  {job.role}
                </Link>
                <p className="text-xs text-[#6B7280] sm:hidden">{job.company}</p>
              </td>
              <td className="px-4 py-3 text-[#1C1C1E] hidden sm:table-cell">
                {job.company}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {job.location ? (
                  <span className="flex items-center gap-1 text-[#6B7280]">
                    <MapPin size={12} />
                    {job.location}
                  </span>
                ) : (
                  <span className="text-[#9CA3AF]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <select
                  value={job.status}
                  onChange={(e) =>
                    onStatusChange(job.id, e.target.value as JobStatus)
                  }
                  className="text-xs border-0 bg-transparent focus:outline-none cursor-pointer"
                  aria-label={`Change status for ${job.role}`}
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <Badge status={job.status} className="hidden sm:inline-flex" />
              </td>
              <td className="px-4 py-3 text-[#6B7280] hidden lg:table-cell">
                {formatRelativeDate(job.appliedDate)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#9CA3AF] hover:text-[#6B9E78] rounded-lg hover:bg-[#F5F5F1] transition-colors"
                      aria-label="Open job posting"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(job)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#6B9E78] rounded-lg hover:bg-[#F5F5F1] transition-colors"
                    aria-label="Edit job"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(job.id)}
                    className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    aria-label="Delete job"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
