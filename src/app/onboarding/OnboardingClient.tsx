"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, MapPin, Target, Zap,
  X, Link2, ChevronRight,
} from "lucide-react";

interface OnboardingClientProps {
  name: string;
}

const STEPS = [
  { id: 1, title: "Your current situation",   icon: Briefcase },
  { id: 2, title: "What you're looking for",  icon: Target },
  { id: 3, title: "Your skills",              icon: Zap },
  { id: 4, title: "Final details",            icon: MapPin },
];

const STATUS_OPTIONS = [
  { value: "actively",  label: "Actively looking",       emoji: "🔥" },
  { value: "open",      label: "Open to opportunities",  emoji: "👀" },
  { value: "exploring", label: "Just exploring",         emoji: "🌱" },
  { value: "employed",  label: "Employed, not looking",  emoji: "✅" },
];

const EXP_OPTIONS = [
  "Less than 1 year", "1–2 years", "3–5 years",
  "6–10 years", "10+ years",
];

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({
  tags, onChange, placeholder, max = 10,
}: {
  tags: string[]; onChange: (tags: string[]) => void;
  placeholder?: string; max?: number;
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= max) return;
    onChange([...tags, trimmed]);
    setInput("");
  };

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && tags.length) remove(tags[tags.length - 1]);
  };

  return (
    <div className="border border-[#E8E8E4] rounded-xl p-3 bg-white focus-within:border-[#6B9E78] transition-colors min-h-[52px]">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag}
            className="inline-flex items-center gap-1.5 bg-[#EEF4F0] text-[#4A7C59] border border-[#C8DDD0] px-2.5 py-1 rounded-full text-xs font-medium">
            {tag}
            <button onClick={() => remove(tag)} className="hover:text-[#9B3D38] transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        {tags.length < max && (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            onBlur={() => add(input)}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            className="flex-1 min-w-[120px] text-sm text-[#1C1C1E] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
        )}
      </div>
      <p className="text-xs text-[#9CA3AF] mt-2">Press Enter or comma to add · {tags.length}/{max}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingClient({ name }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [status, setStatus]           = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [yearsExp, setYearsExp]       = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [skills, setSkills]           = useState<string[]>([]);
  const [location, setLocation]       = useState("");
  const [linkedin, setLinkedin]       = useState("");

  const firstName = name.split(" ")[0] || "there";
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const canNext = () => {
    if (step === 1) return !!status;
    if (step === 2) return targetRoles.length > 0;
    if (step === 3) return skills.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole,
          yearsExp,
          targetRoles:     targetRoles.join(", "),
          targetCompanies: targetCompanies.join(", "),
          skills:          skills.join(", "),
          jobSearchStatus: status,
          location,
          linkedinUrl:     linkedin,
          onboarded:       true,
        }),
      });
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarded: true }),
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#6B9E78] rounded-lg flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Pipelio</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E8E8E4] shadow-sm overflow-hidden"
          style={{ animation: "fadeUp 0.4s ease both" }}>

          {/* Progress bar */}
          <div className="h-1 bg-[#F0F0EC]">
            <div className="h-1 bg-[#6B9E78] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }} />
          </div>

          {/* Step header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#F0F0EC]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#6B9E78] uppercase tracking-wide">
                Step {step} of {STEPS.length}
              </span>
            </div>
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-[#1C1C1E]">
                  Hey {firstName}! 👋
                </h1>
                <p className="text-[#6B7280] text-sm mt-1">
                  Let's set up your profile so Pipelio can personalize your experience.
                </p>
              </>
            )}
            {step !== 1 && (
              <>
                <h1 className="text-xl font-bold text-[#1C1C1E]">
                  {STEPS[step - 1].title}
                </h1>
                <p className="text-[#6B7280] text-sm mt-1">
                  This helps personalize your AI tools and dashboard.
                </p>
              </>
            )}
          </div>

          {/* Step content */}
          <div className="px-8 py-6 space-y-5">

            {/* Step 1 — Current situation */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-3">
                    What's your job search status?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setStatus(opt.value)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all"
                        style={{
                          background: status === opt.value ? "#EEF4F0" : "white",
                          borderColor: status === opt.value ? "#C8DDD0" : "#E8E8E4",
                          color: status === opt.value ? "#4A7C59" : "#1C1C1E",
                        }}>
                        <span className="text-lg">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Current / most recent role
                  </label>
                  <input value={currentRole} onChange={e => setCurrentRole(e.target.value)}
                    placeholder="e.g. Frontend Developer at Acme Corp"
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] outline-none focus:border-[#6B9E78] transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Years of experience
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXP_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => setYearsExp(opt)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                        style={{
                          background: yearsExp === opt ? "#EEF4F0" : "white",
                          borderColor: yearsExp === opt ? "#C8DDD0" : "#E8E8E4",
                          color: yearsExp === opt ? "#4A7C59" : "#6B7280",
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2 — What you're looking for */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Target roles <span className="text-[#9B3D38]">*</span>
                  </label>
                  <TagInput tags={targetRoles} onChange={setTargetRoles}
                    placeholder="e.g. Frontend Engineer, React Developer..." max={8} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Dream companies <span className="text-[#6B7280] font-normal">(optional)</span>
                  </label>
                  <TagInput tags={targetCompanies} onChange={setTargetCompanies}
                    placeholder="e.g. Stripe, Vercel, Notion..." max={10} />
                </div>
              </>
            )}

            {/* Step 3 — Skills */}
            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                  Your key skills <span className="text-[#9B3D38]">*</span>
                </label>
                <TagInput tags={skills} onChange={setSkills}
                  placeholder="e.g. React, TypeScript, Node.js..." max={20} />
                <p className="text-xs text-[#6B7280] mt-3">
                  These will be used to pre-fill your AI tools and improve job match accuracy.
                </p>
              </div>
            )}

            {/* Step 4 — Final details */}
            {step === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                    Location / work preference
                  </label>
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. New York, NY · Open to remote"
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] outline-none focus:border-[#6B9E78] transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1E] mb-2 flex items-center gap-1.5">
                    <Link2 size={14} className="text-[#0A66C2]" />
                    LinkedIn URL <span className="text-[#6B7280] font-normal">(optional)</span>
                  </label>
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] outline-none focus:border-[#6B9E78] transition-colors" />
                </div>

                {/* Summary preview */}
                <div className="bg-[#F5F5F1] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                    Your profile summary
                  </p>
                  {[
                    { label: "Status",   value: STATUS_OPTIONS.find(s => s.value === status)?.label },
                    { label: "Role",     value: currentRole || "—" },
                    { label: "Exp",      value: yearsExp || "—" },
                    { label: "Looking for", value: targetRoles.join(", ") || "—" },
                    { label: "Skills",   value: skills.slice(0, 5).join(", ") + (skills.length > 5 ? "..." : "") || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="text-[#9CA3AF] w-24 shrink-0">{label}</span>
                      <span className="text-[#1C1C1E] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button onClick={handleSkip}
              className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              Skip for now
            </button>
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8E8E4] text-sm font-medium text-[#6B7280] hover:bg-[#F5F5F1] transition-colors">
                  Back
                </button>
              )}
              <button onClick={handleNext} disabled={!canNext() || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: canNext() && !saving ? "#6B9E78" : "#9DC4A8" }}>
                {saving ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
                ) : step === STEPS.length ? (
                  <><Zap size={14} />Go to Dashboard</>
                ) : (
                  <>Next<ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {STEPS.map(s => (
            <div key={s.id}
              className="rounded-full transition-all duration-300"
              style={{
                width: step === s.id ? "20px" : "6px",
                height: "6px",
                background: s.id <= step ? "#6B9E78" : "#E8E8E4",
              }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
