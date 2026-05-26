"use client";

import { useState } from "react";
import {
  X, ClipboardList, Star, ChevronRight, CheckCircle,
} from "lucide-react";

interface DebriefModalProps {
  jobId: string;
  jobRole: string;
  jobCompany: string;
  onClose: () => void;
  onSaved?: () => void;
}

const ROUNDS = [
  "Round 1 — Recruiter Screen",
  "Round 2 — Technical Phone Screen",
  "Round 3 — Technical Assignment",
  "Round 4 — System Design",
  "Round 5 — Hiring Manager",
  "Round 6 — Final / Panel",
  "Other",
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "😬 Rough", "😐 Okay", "🙂 Good", "😊 Great", "🤩 Amazing"];

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} star`}
          >
            <Star
              size={24}
              className="transition-colors"
              fill={(hovered || value) >= n ? "#E8A598" : "none"}
              stroke={(hovered || value) >= n ? "#E8A598" : "#D1D5DB"}
            />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="text-xs text-[#6B7280] ml-2">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DebriefModal({
  jobId, jobRole, jobCompany, onClose, onSaved,
}: DebriefModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    round:           "",
    interviewerName: "",
    interviewDate:   new Date().toISOString().split("T")[0],
    technicalQs:     "",
    behavioralQs:    "",
    cultureScore:    0,
    notes:           "",
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/jobs/${jobId}/debrief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
        style={{ animation: "modalEnter 0.25s ease both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#EEF4F0] rounded-lg flex items-center justify-center">
              <ClipboardList size={16} className="text-[#6B9E78]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1C1C1E] text-sm">Interview Debrief</h2>
              <p className="text-xs text-[#6B7280]">{jobRole} · {jobCompany}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F5F5F1] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#F0F0EC]">
          <div className="h-1 bg-[#6B9E78] transition-all duration-400"
            style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="p-6">
          {saved ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-14 h-14 bg-[#EEF4F0] rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-[#6B9E78]" />
              </div>
              <p className="font-semibold text-[#1C1C1E]">Debrief saved!</p>
              <p className="text-sm text-[#6B7280]">Added to your interview log.</p>
            </div>
          ) : (
            <>
              {/* Step 1 — Basic info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                      Step 1 of 3 — Interview Details
                    </p>
                    <p className="text-sm text-[#1C1C1E] font-medium mb-4">
                      Which round was this?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {ROUNDS.map(r => (
                      <button key={r} type="button" onClick={() => set("round", r)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${
                          form.round === r
                            ? "bg-[#EEF4F0] border-[#C8DDD0] text-[#4A7C59] font-medium"
                            : "bg-white border-[#E8E8E4] text-[#6B7280] hover:border-[#C8DDD0]"
                        }`}>
                        {r}
                        {form.round === r && <CheckCircle size={14} className="text-[#6B9E78]" />}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Interviewer name
                      </label>
                      <input value={form.interviewerName}
                        onChange={e => set("interviewerName", e.target.value)}
                        placeholder="e.g. Sarah from Engineering"
                        className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                        Interview date
                      </label>
                      <input type="date" value={form.interviewDate}
                        onChange={e => set("interviewDate", e.target.value)}
                        className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#6B9E78] transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Questions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                      Step 2 of 3 — Questions Asked
                    </p>
                    <p className="text-sm text-[#1C1C1E] font-medium mb-4">
                      Log what was asked while it's fresh
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                      Technical questions asked
                    </label>
                    <textarea value={form.technicalQs}
                      onChange={e => set("technicalQs", e.target.value)}
                      placeholder="e.g. Explain event loop in JS, Design a rate limiter, Reverse a linked list..."
                      rows={4}
                      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B9E78] transition-colors" />
                    <p className="text-xs text-[#9CA3AF] mt-1">One per line is fine</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                      Behavioral questions I struggled with
                    </label>
                    <textarea value={form.behavioralQs}
                      onChange={e => set("behavioralQs", e.target.value)}
                      placeholder="e.g. Tell me about a conflict with a teammate, Describe a time you failed..."
                      rows={3}
                      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B9E78] transition-colors" />
                  </div>
                </div>
              )}

              {/* Step 3 — Vibe check */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">
                      Step 3 of 3 — Vibe Check
                    </p>
                    <p className="text-sm text-[#1C1C1E] font-medium mb-4">
                      How did it feel?
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                      Culture / team vibe score
                    </label>
                    <StarRating value={form.cultureScore} onChange={v => set("cultureScore", v)} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
                      Additional notes
                    </label>
                    <textarea value={form.notes}
                      onChange={e => set("notes", e.target.value)}
                      placeholder="How did it go overall? Red flags? Things to prepare for next round..."
                      rows={4}
                      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#6B9E78] transition-colors" />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F0F0EC]">
                <div className="flex gap-2">
                  {step > 1 && (
                    <button onClick={() => setStep(s => s - 1)}
                      className="px-4 py-2 text-sm text-[#6B7280] border border-[#E8E8E4] rounded-lg hover:bg-[#F5F5F1] transition-colors">
                      Back
                    </button>
                  )}
                  <button onClick={onClose}
                    className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                    Skip for now
                  </button>
                </div>

                {step < totalSteps ? (
                  <button onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-2 bg-[#6B9E78] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A8A67] transition-colors">
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[#6B9E78] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A8A67] transition-colors disabled:opacity-50">
                    {saving ? "Saving..." : "Save Debrief"}
                    <CheckCircle size={14} />
                  </button>
                )}
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
