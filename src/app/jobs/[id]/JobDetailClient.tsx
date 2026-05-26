"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import JobForm from "@/components/jobs/JobForm";
import DebriefModal from "@/components/jobs/DebriefModal";
import CompanyInsights from "@/components/jobs/CompanyInsights";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { getRoundLabel } from "@/lib/interview-rounds";
import {
  ArrowLeft, MapPin, DollarSign, ExternalLink,
  Calendar, Clock, Pencil, Trash2, User,
  ClipboardList, Star, Plus,
} from "lucide-react";
import Link from "next/link";

interface JobDetailClientProps {
  job: Job;
}

export default function JobDetailClient({ job: initialJob }: JobDetailClientProps) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [editOpen, setEditOpen] = useState(false);
  const [debriefOpen, setDebriefOpen] = useState(false);
  const [debrief, setDebrief] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing debrief
  useEffect(() => {
    fetch(`/api/jobs/${job.id}/debrief`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setDebrief(d))
      .catch(() => {});
  }, [job.id]);

  const handleUpdate = async (data: any) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setJob(updated);
        setEditOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this job application? This cannot be undone.")) return;
    const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  };

  return (
    <>
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C1C1E] mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to board
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1C1C1E]">{job.role}</h1>
                <p className="text-lg text-[#6B7280] mt-1">{job.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <Badge status={job.status} />
              {job.interviewRound && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F3F0FA] text-[#5B4B8A] border border-[#D4C8F0]">
                  {getRoundLabel(job.interviewRound)}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <MapPin size={14} />
                  {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                  <DollarSign size={14} />
                  {job.salary}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Applied {formatDate(job.appliedDate)}
              </span>
              {job.deadline && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Deadline {formatDate(job.deadline)}
                </span>
              )}
            </div>

            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-[#6B9E78] hover:text-[#5A8A67] font-medium"
              >
                <ExternalLink size={14} />
                View job posting
              </a>
            )}
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-3">Notes</h2>
              <p className="text-[#1C1C1E] text-sm leading-relaxed whitespace-pre-wrap">
                {job.notes}
              </p>
            </div>
          )}

          {/* Contacts */}
          {job.contacts && job.contacts.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
              <h2 className="font-semibold text-[#1C1C1E] mb-4">Contacts</h2>
              <div className="space-y-3">
                {job.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-start gap-3 p-3 bg-[#FAFAF8] rounded-lg"
                  >
                    <div className="w-8 h-8 bg-[#EEF4F0] rounded-full flex items-center justify-center shrink-0">
                      <User size={14} className="text-[#6B9E78]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1C1C1E] text-sm">
                        {contact.name}
                      </p>
                      {contact.role && (
                        <p className="text-xs text-[#6B7280]">{contact.role}</p>
                      )}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-xs text-[#6B9E78] hover:underline"
                        >
                          {contact.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview Debrief */}
        <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1C1C1E] flex items-center gap-2">
              <ClipboardList size={16} className="text-[#6B9E78]" />
              Interview Debrief
            </h2>
            <button onClick={() => setDebriefOpen(true)}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] border border-[#E8E8E4] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F1] transition-colors">
              {debrief ? <><Pencil size={11} />Edit</> : <><Plus size={11} />Add</>}
            </button>
          </div>

          {debrief ? (
            <div className="space-y-4">
              {debrief.round && (
                <span className="inline-flex items-center bg-[#EEF4F0] text-[#4A7C59] text-xs font-medium px-3 py-1 rounded-full border border-[#C8DDD0]">
                  {debrief.round}
                </span>
              )}
              {debrief.cultureScore && (
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Vibe Score</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={16}
                        fill={n <= debrief.cultureScore ? "#E8A598" : "none"}
                        stroke={n <= debrief.cultureScore ? "#E8A598" : "#D1D5DB"} />
                    ))}
                    <span className="text-xs text-[#6B7280] ml-1">{debrief.cultureScore}/5</span>
                  </div>
                </div>
              )}
              {debrief.technicalQs && (
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Technical Questions</p>
                  <div className="bg-[#F5F5F1] rounded-lg p-3 text-sm text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">{debrief.technicalQs}</div>
                </div>
              )}
              {debrief.behavioralQs && (
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Struggled With</p>
                  <div className="bg-[#FEF9EE] border border-[#F5DFA0] rounded-lg p-3 text-sm text-[#92681A] whitespace-pre-wrap leading-relaxed">{debrief.behavioralQs}</div>
                </div>
              )}
              {debrief.notes && (
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Notes</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-wrap">{debrief.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-sm text-[#9CA3AF] mb-2">No debrief logged yet.</p>
              <button onClick={() => setDebriefOpen(true)} className="text-xs font-semibold text-[#6B9E78] hover:underline">
                + Log interview debrief
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-[#E8E8E4] p-6 h-fit">
          <h2 className="font-semibold text-[#1C1C1E] mb-4">Timeline</h2>
          {job.timeline && job.timeline.length > 0 ? (
            <div className="space-y-4">
              {job.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#6B9E78] shrink-0 mt-1" />
                    {i < (job.timeline?.length ?? 0) - 1 && (
                      <div className="w-px flex-1 bg-[#E8E8E4] mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[#1C1C1E]">
                      {event.event}
                    </p>
                    {event.note && (
                      <p className="text-xs text-[#6B7280] mt-0.5">{event.note}</p>
                    )}
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      {formatRelativeDate(event.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9CA3AF]">No timeline events yet.</p>
          )}
        </div>

        {/* Community insights */}
        <CompanyInsights company={job.company} />
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Job"
        size="lg"
      >
        <JobForm
          job={job}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          loading={submitting}
        />
      </Modal>

      {/* Debrief modal */}
      {debriefOpen && (
        <DebriefModal
          jobId={job.id}
          jobRole={job.role}
          jobCompany={job.company}
          onClose={() => setDebriefOpen(false)}
          onSaved={() => {
            setDebriefOpen(false);
            // Refresh debrief
            fetch(`/api/jobs/${job.id}/debrief`)
              .then(r => r.ok ? r.json() : null)
              .then(d => setDebrief(d))
              .catch(() => {});
          }}
        />
      )}
    </>
  );
}
