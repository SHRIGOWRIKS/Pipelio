"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles, FileText, Target, Loader2, AlertCircle,
  Upload, X, CheckCircle, File, Mail, MessageSquare,
  Search, Copy, ChevronDown, ChevronUp, DollarSign,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResumeResult {
  summary: string; skills: string[]; level: string; improvements: string[];
}
interface MatchResult {
  matchScore: number; matchedSkills: string[]; missingSkills: string[];
  summary: string; tips: string[];
}
interface CoverLetterResult {
  subject: string; body: string; tips: string[];
}
interface InterviewQuestion {
  category: string; question: string; why: string;
  hint: string; framework: string;
}
interface InterviewResult {
  role: string; company: string; questions: InterviewQuestion[];
  keyTopics: string[]; redFlags: string[]; questionsToAsk: string[];
}
interface JDResult {
  role: string; company: string; seniorityLevel: string;
  actualRequirements: string[]; niceToHave: string[];
  redFlags: string[]; greenFlags: string[]; cultureSignals: string[];
  salaryInsight: string; competitionLevel: string; applyAdvice: string;
  hiddenRequirements: string[]; keywordsToUse: string[];
}

type TabId = "resume" | "match" | "cover" | "interview" | "decoder" | "salary";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "resume",    label: "Resume Analyzer",  icon: FileText },
  { id: "match",     label: "Job Match",         icon: Target },
  { id: "cover",     label: "Cover Letter",      icon: Mail },
  { id: "interview", label: "Interview Prep",    icon: MessageSquare },
  { id: "decoder",   label: "JD Decoder",        icon: Search },
  { id: "salary",    label: "Salary Negotiation", icon: DollarSign },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
const SAGE = "#6B9E78";
const SAGE_DARK = "#5A8A67";
const SAGE_BG = "#EEF4F0";
const SAGE_BORDER = "#C8DDD0";
const SAGE_TEXT = "#4A7C59";
const RED_BG = "#FDF0EF";
const RED_BORDER = "#F5C6C3";
const RED_TEXT = "#9B3D38";
const AMBER_BG = "#FEF9EE";
const AMBER_TEXT = "#92681A";

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
      style={{ background: RED_BG, border: `1px solid ${RED_BORDER}`, color: RED_TEXT }}>
      <AlertCircle size={15} className="shrink-0" />{msg}
    </div>
  );
}

function SkillBadge({ label, variant = "green" }: { label: string; variant?: "green" | "red" | "amber" | "gray" }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    green: { bg: SAGE_BG, color: SAGE_TEXT, border: SAGE_BORDER },
    red:   { bg: RED_BG,  color: RED_TEXT,  border: RED_BORDER },
    amber: { bg: AMBER_BG, color: AMBER_TEXT, border: "#F5DFA0" },
    gray:  { bg: "#F5F5F1", color: "#6B7280", border: "#E8E8E4" },
  };
  const s = styles[variant];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {label}
    </span>
  );
}

function SageButton({ onClick, disabled, loading, loadingText, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean;
  loadingText?: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: loading || disabled ? "#9DC4A8" : SAGE }}
      onMouseEnter={e => { if (!disabled && !loading) (e.target as HTMLElement).style.background = SAGE_DARK; }}
      onMouseLeave={e => { if (!disabled && !loading) (e.target as HTMLElement).style.background = SAGE; }}>
      {loading ? <><Loader2 size={14} className="animate-spin" />{loadingText || "Loading..."}</> : children}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
      style={{ background: copied ? SAGE_BG : "white", color: copied ? SAGE_TEXT : "#6B7280", borderColor: copied ? SAGE_BORDER : "#E8E8E4" }}>
      {copied ? <><CheckCircle size={12} />Copied!</> : <><Copy size={12} />Copy</>}
    </button>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1C1C1E]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 8, disabled }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; disabled?: boolean;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} disabled={disabled}
      className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] resize-none focus:outline-none transition-colors disabled:bg-[#F5F5F1] disabled:cursor-not-allowed"
      style={{ focusBorderColor: SAGE } as React.CSSProperties}
      onFocus={e => e.target.style.borderColor = SAGE}
      onBlur={e => e.target.style.borderColor = "#E8E8E4"} />
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-[#E8E8E4]" />
      <span className="text-xs text-[#6B7280] font-medium">or paste text</span>
      <div className="flex-1 h-px bg-[#E8E8E4]" />
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function FileUploadZone({ onTextExtracted, label, currentFileName, onClear }: {
  onTextExtracted: (text: string, name: string) => void;
  label: string; currentFileName?: string; onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (![".pdf", ".doc", ".docx", ".txt"].includes(ext)) {
      setError("Only PDF, DOC, DOCX, or TXT supported."); return;
    }
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB."); return; }
    setError(""); setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/parse-file", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to parse.");
      else onTextExtracted(data.text, file.name);
    } catch { setError("Upload failed. Try pasting manually."); }
    finally { setUploading(false); }
  }, [onTextExtracted]);

  if (currentFileName) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: SAGE_BG, border: `1px solid ${SAGE_BORDER}` }}>
        <File size={15} style={{ color: SAGE }} className="shrink-0" />
        <span className="text-sm font-medium flex-1 truncate" style={{ color: SAGE_TEXT }}>{currentFileName}</span>
        <CheckCircle size={14} style={{ color: SAGE }} className="shrink-0" />
        <button onClick={onClear} className="text-[#6B7280] hover:text-[#1C1C1E] transition-colors ml-1"><X size={13} /></button>
      </div>
    );
  }

  return (
    <div>
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
        style={{ borderColor: dragging ? SAGE : "#E8E8E4", background: dragging ? SAGE_BG : "transparent" }}>
        {uploading ? <Loader2 size={18} className="animate-spin" style={{ color: SAGE }} /> : <Upload size={18} className="text-[#6B7280]" />}
        <p className="text-sm font-medium text-[#1C1C1E]">{uploading ? "Parsing..." : label}</p>
        <p className="text-xs text-[#6B7280]">PDF, DOCX, DOC, TXT · Max 5MB</p>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      {error && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: RED_TEXT }}><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

// ─── Tab: Resume Analyzer ─────────────────────────────────────────────────────
function ResumeTab() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <p className="text-sm font-medium text-[#1C1C1E] mb-3">Upload your resume</p>
        <FileUploadZone label="Drop resume here or click to browse"
          currentFileName={fileName}
          onTextExtracted={(t, n) => { setText(t); setFileName(n); setResult(null); setError(""); }}
          onClear={() => { setText(""); setFileName(""); setResult(null); }} />
        <OrDivider />
        <Textarea value={fileName ? "" : text} onChange={v => { setText(v); setFileName(""); setResult(null); }}
          placeholder="...or paste your resume text here" disabled={!!fileName} />
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#6B7280]">
            {fileName ? `${text.length.toLocaleString()} chars extracted` : `${text.length} chars`}
          </p>
          <SageButton onClick={analyze} disabled={!text.trim()} loading={loading} loadingText="Analyzing...">
            <Sparkles size={14} />Analyze Resume
          </SageButton>
        </div>
      </div>
      {error && <ErrorBanner msg={error} />}
      {result && (
        <div className="space-y-4 fade-up">
          <Card title="Professional Summary">
            <p className="text-sm text-[#6B7280] leading-relaxed mb-3">{result.summary}</p>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: SAGE_BG, color: SAGE_TEXT }}>
              {result.level}
            </span>
          </Card>
          <Card title="Key Skills">
            <div className="flex flex-wrap gap-2">
              {result.skills.map(s => <SkillBadge key={s} label={s} />)}
            </div>
          </Card>
          <Card title="Improvement Suggestions">
            <ul className="space-y-3">
              {result.improvements.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#6B7280]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: AMBER_BG, color: AMBER_TEXT }}>{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Job Match ───────────────────────────────────────────────────────────
function MatchTab() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");

  const scoreColor = (s: number) => s >= 70 ? SAGE : s >= 40 ? AMBER_TEXT : RED_TEXT;
  const scoreBg = (s: number) => s >= 70 ? SAGE_BG : s >= 40 ? AMBER_BG : RED_BG;

  const check = async () => {
    if (!resumeText.trim() || !jd.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Your Resume</p>
            <FileUploadZone label="Upload resume (PDF, DOCX, TXT)"
              currentFileName={resumeFileName}
              onTextExtracted={(t, n) => { setResumeText(t); setResumeFileName(n); setResult(null); }}
              onClear={() => { setResumeText(""); setResumeFileName(""); setResult(null); }} />
            <OrDivider />
            <Textarea value={resumeFileName ? "" : resumeText}
              onChange={v => { setResumeText(v); setResumeFileName(""); setResult(null); }}
              placeholder="...or paste resume text" disabled={!!resumeFileName} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Job Description</p>
            <Textarea value={jd} onChange={v => { setJd(v); setResult(null); }}
              placeholder="Paste the job description here..." rows={14} />
          </div>
        </div>
        <div className="flex justify-end">
          <SageButton onClick={check} disabled={!resumeText.trim() || !jd.trim()} loading={loading} loadingText="Checking...">
            <Target size={14} />Check Match
          </SageButton>
        </div>
      </div>
      {error && <ErrorBanner msg={error} />}
      {result && (
        <div className="space-y-4 fade-up">
          <div className="bg-white rounded-xl border border-[#E8E8E4] p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center shrink-0 border-4"
              style={{ background: scoreBg(result.matchScore), borderColor: scoreColor(result.matchScore) }}>
              <span className="text-2xl font-bold" style={{ color: scoreColor(result.matchScore) }}>{result.matchScore}%</span>
              <span className="text-xs font-medium" style={{ color: scoreColor(result.matchScore) }}>Match</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C1E] mb-2">Match Summary</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{result.summary}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="✓ Matched Skills">
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.length > 0
                  ? result.matchedSkills.map(s => <SkillBadge key={s} label={s} />)
                  : <p className="text-xs text-[#6B7280]">None found</p>}
              </div>
            </Card>
            <Card title="✗ Missing Skills">
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.length > 0
                  ? result.missingSkills.map(s => <SkillBadge key={s} label={s} variant="red" />)
                  : <p className="text-xs text-[#6B7280]">Great match — no gaps!</p>}
              </div>
            </Card>
          </div>
          <Card title="Tips to Improve Your Match">
            <ul className="space-y-3">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#6B7280]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: SAGE_BG, color: SAGE_TEXT }}>{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Cover Letter ────────────────────────────────────────────────────────
function CoverLetterTab() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState<"confident" | "formal" | "casual">("confident");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!resumeText.trim() || !jd.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jd, tone }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  const tones = [
    { value: "confident", label: "Confident" },
    { value: "formal",    label: "Formal" },
    { value: "casual",    label: "Casual" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Your Resume</p>
            <FileUploadZone label="Upload resume (PDF, DOCX, TXT)"
              currentFileName={resumeFileName}
              onTextExtracted={(t, n) => { setResumeText(t); setResumeFileName(n); setResult(null); }}
              onClear={() => { setResumeText(""); setResumeFileName(""); setResult(null); }} />
            <OrDivider />
            <Textarea value={resumeFileName ? "" : resumeText}
              onChange={v => { setResumeText(v); setResumeFileName(""); setResult(null); }}
              placeholder="...or paste resume text" disabled={!!resumeFileName} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Job Description</p>
            <Textarea value={jd} onChange={v => { setJd(v); setResult(null); }}
              placeholder="Paste the job description here..." rows={12} />
          </div>
        </div>

        {/* Tone selector */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-medium text-[#1C1C1E]">Tone:</span>
          <div className="flex gap-2">
            {tones.map(t => (
              <button key={t.value} onClick={() => setTone(t.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: tone === t.value ? SAGE_BG : "white",
                  color: tone === t.value ? SAGE_TEXT : "#6B7280",
                  borderColor: tone === t.value ? SAGE_BORDER : "#E8E8E4",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <SageButton onClick={generate} disabled={!resumeText.trim() || !jd.trim()} loading={loading} loadingText="Writing...">
            <Mail size={14} />Generate Cover Letter
          </SageButton>
        </div>
      </div>
      {error && <ErrorBanner msg={error} />}
      {result && (
        <div className="space-y-4 fade-up">
          <Card title="Email Subject Line" action={<CopyButton text={result.subject} />}>
            <p className="text-sm text-[#1C1C1E] font-medium bg-[#F5F5F1] rounded-lg px-3 py-2">
              {result.subject}
            </p>
          </Card>
          <Card title="Cover Letter" action={<CopyButton text={result.body} />}>
            <div className="text-sm text-[#1C1C1E] leading-relaxed whitespace-pre-wrap bg-[#FAFAF8] rounded-lg p-4 border border-[#E8E8E4]">
              {result.body}
            </div>
          </Card>
          <Card title="Tips for This Letter">
            <ul className="space-y-2.5">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#6B7280]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: SAGE_BG, color: SAGE_TEXT }}>{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Interview Prep ──────────────────────────────────────────────────────
function InterviewTab() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [error, setError] = useState("");
  const [openQ, setOpenQ] = useState<number | null>(null);

  const generate = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  const categoryColor: Record<string, { bg: string; color: string }> = {
    "Behavioral":   { bg: "#EEF4F0", color: "#4A7C59" },
    "Technical":    { bg: "#EEF0F9", color: "#3D4A9B" },
    "Situational":  { bg: "#FEF9EE", color: "#92681A" },
    "Culture Fit":  { bg: "#FDF0EF", color: "#9B3D38" },
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Job Description <span className="text-[#9B3D38]">*</span></p>
            <Textarea value={jd} onChange={v => { setJd(v); setResult(null); }}
              placeholder="Paste the job description here..." rows={12} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1C1E] mb-3">Your Resume <span className="text-[#6B7280] font-normal">(optional — improves results)</span></p>
            <FileUploadZone label="Upload resume for better questions"
              currentFileName={resumeFileName}
              onTextExtracted={(t, n) => { setResumeText(t); setResumeFileName(n); }}
              onClear={() => { setResumeText(""); setResumeFileName(""); }} />
            <OrDivider />
            <Textarea value={resumeFileName ? "" : resumeText}
              onChange={v => { setResumeText(v); setResumeFileName(""); }}
              placeholder="...or paste resume text" rows={6} disabled={!!resumeFileName} />
          </div>
        </div>
        <div className="flex justify-end">
          <SageButton onClick={generate} disabled={!jd.trim()} loading={loading} loadingText="Generating...">
            <MessageSquare size={14} />Generate Interview Prep
          </SageButton>
        </div>
      </div>
      {error && <ErrorBanner msg={error} />}
      {result && (
        <div className="space-y-4 fade-up">
          {/* Key topics */}
          <Card title="Key Topics to Study">
            <div className="flex flex-wrap gap-2">
              {result.keyTopics.map(t => <SkillBadge key={t} label={t} variant="amber" />)}
            </div>
          </Card>

          {/* Questions accordion */}
          <div className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E8E4]">
              <h3 className="text-sm font-semibold text-[#1C1C1E]">
                {result.questions.length} Predicted Interview Questions
              </h3>
            </div>
            {result.questions.map((q, i) => {
              const cat = categoryColor[q.category] || { bg: "#F5F5F1", color: "#6B7280" };
              return (
                <div key={i} className="border-b border-[#E8E8E4] last:border-0">
                  <button onClick={() => setOpenQ(openQ === i ? null : i)}
                    className="w-full flex items-start gap-3 px-6 py-4 text-left hover:bg-[#FAFAF8] transition-colors">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 mt-0.5"
                      style={{ background: cat.bg, color: cat.color }}>{q.category}</span>
                    <span className="text-sm font-medium text-[#1C1C1E] flex-1">{q.question}</span>
                    {openQ === i ? <ChevronUp size={15} className="text-[#6B7280] shrink-0 mt-0.5" />
                      : <ChevronDown size={15} className="text-[#6B7280] shrink-0 mt-0.5" />}
                  </button>
                  {openQ === i && (
                    <div className="px-6 pb-4 space-y-3">
                      <div className="bg-[#F5F5F1] rounded-lg p-3">
                        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Why they ask this</p>
                        <p className="text-sm text-[#1C1C1E]">{q.why}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: SAGE_BG }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: SAGE_TEXT }}>
                          Key points to cover {q.framework !== "Open" && `· ${q.framework} framework`}
                        </p>
                        <p className="text-sm" style={{ color: SAGE_TEXT }}>{q.hint}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Questions to ask */}
          <Card title="Questions to Ask the Interviewer">
            <ul className="space-y-2">
              {result.questionsToAsk.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                  <span className="text-[#6B9E78] font-bold shrink-0">→</span>{q}
                </li>
              ))}
            </ul>
          </Card>

          {/* Red flags */}
          {result.redFlags.length > 0 && (
            <Card title="⚠ Things to Watch Out For">
              <ul className="space-y-2">
                {result.redFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: RED_TEXT }}>
                    <span className="shrink-0 font-bold">!</span>{f}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab: JD Decoder ─────────────────────────────────────────────────────────
function JDDecoderTab() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDResult | null>(null);
  const [error, setError] = useState("");

  const decode = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/jd-decoder", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  const competitionStyle = (level: string) => {
    if (level === "Low") return { bg: SAGE_BG, color: SAGE_TEXT };
    if (level === "Medium") return { bg: AMBER_BG, color: AMBER_TEXT };
    return { bg: RED_BG, color: RED_TEXT };
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <p className="text-sm font-medium text-[#1C1C1E] mb-3">
          Paste a job description to decode it
        </p>
        <Textarea value={jd} onChange={v => { setJd(v); setResult(null); }}
          placeholder="Paste the full job description here..." rows={12} />
        <div className="flex justify-end mt-4">
          <SageButton onClick={decode} disabled={!jd.trim()} loading={loading} loadingText="Decoding...">
            <Search size={14} />Decode Job Description
          </SageButton>
        </div>
      </div>
      {error && <ErrorBanner msg={error} />}
      {result && (
        <div className="space-y-4 fade-up">
          {/* Overview row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Role", value: result.role || "—" },
              { label: "Company", value: result.company || "—" },
              { label: "Seniority", value: result.seniorityLevel },
              { label: "Competition", value: result.competitionLevel,
                style: competitionStyle(result.competitionLevel) },
            ].map(({ label, value, style }) => (
              <div key={label} className="bg-white rounded-xl border border-[#E8E8E4] p-4">
                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#1C1C1E]"
                  style={style ? { color: style.color } : undefined}>{value}</p>
              </div>
            ))}
          </div>

          {/* Apply advice */}
          <div className="rounded-xl p-4 border" style={{ background: SAGE_BG, borderColor: SAGE_BORDER }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: SAGE_TEXT }}>
              💡 Apply Advice
            </p>
            <p className="text-sm leading-relaxed" style={{ color: SAGE_TEXT }}>{result.applyAdvice}</p>
          </div>

          {/* Skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="✓ Actually Required">
              <div className="flex flex-wrap gap-2">
                {result.actualRequirements.map(s => <SkillBadge key={s} label={s} />)}
              </div>
            </Card>
            <Card title="○ Nice to Have">
              <div className="flex flex-wrap gap-2">
                {result.niceToHave.map(s => <SkillBadge key={s} label={s} variant="gray" />)}
              </div>
            </Card>
          </div>

          {/* Keywords */}
          <Card title="🔑 Keywords to Use in Your Resume & Cover Letter">
            <div className="flex flex-wrap gap-2">
              {result.keywordsToUse.map(k => <SkillBadge key={k} label={k} variant="amber" />)}
            </div>
          </Card>

          {/* Signals grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="✅ Green Flags">
              <ul className="space-y-2">
                {result.greenFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <span style={{ color: SAGE }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="⚠ Red Flags">
              <ul className="space-y-2">
                {result.redFlags.length > 0
                  ? result.redFlags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: RED_TEXT }}>
                      <span>!</span>{f}
                    </li>
                  ))
                  : <p className="text-sm text-[#6B7280]">No red flags detected 🎉</p>}
              </ul>
            </Card>
          </div>

          {/* Culture + Hidden */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="🏢 Culture Signals">
              <ul className="space-y-2">
                {result.cultureSignals.map((s, i) => (
                  <li key={i} className="text-sm text-[#6B7280] flex items-start gap-2">
                    <span className="text-[#6B7280]">·</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="👁 Hidden Requirements">
              <ul className="space-y-2">
                {result.hiddenRequirements.map((r, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: AMBER_TEXT }}>
                    <span>·</span>{r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Salary */}
          <Card title="💰 Salary Insight">
            <p className="text-sm text-[#6B7280] leading-relaxed">{result.salaryInsight}</p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Salary Negotiation ──────────────────────────────────────────────────
function SalaryTab() {
  const [form, setForm] = useState({
    offerAmount: "", role: "", location: "", yearsExp: "", currentSalary: "", currency: "$",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const analyze = async () => {
    if (!form.offerAmount || !form.role) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/ai/salary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setResult(data);
    } catch { setError("Failed to connect to AI service"); }
    finally { setLoading(false); }
  };

  const copyScript = async () => {
    if (!result?.counterScript) return;
    await navigator.clipboard.writeText(result.counterScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verdictStyle = (v: string) => {
    if (v === "above_market") return { bg: SAGE_BG, color: SAGE_TEXT, border: SAGE_BORDER, emoji: "🎉" };
    if (v === "at_market")    return { bg: AMBER_BG, color: AMBER_TEXT, border: "#F5DFA0", emoji: "✅" };
    return { bg: RED_BG, color: RED_TEXT, border: RED_BORDER, emoji: "⚠️" };
  };

  const fmt = (n: number) => form.currency + n.toLocaleString();

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
        <p className="text-sm font-medium text-[#1C1C1E] mb-1">Enter your offer details</p>
        <p className="text-xs text-[#9CA3AF] mb-4">AI analysis based on 2024-2025 market data. Results are estimates — verify with Glassdoor, Levels.fyi, or LinkedIn Salary.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
              Offer Amount <span className="text-[#9B3D38]">*</span>
            </label>
            <div className="flex gap-2">
              <select value={form.currency} onChange={e => set("currency", e.target.value)}
                className="border border-[#E8E8E4] rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-[#6B9E78] w-16">
                {["$", "€", "£", "₹", "¥"].map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.offerAmount} onChange={e => set("offerAmount", e.target.value)}
                placeholder="e.g. 120000" type="number"
                className="flex-1 border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
              Role / Title <span className="text-[#9B3D38]">*</span>
            </label>
            <input value={form.role} onChange={e => set("role", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
              Location
            </label>
            <input value={form.location} onChange={e => set("location", e.target.value)}
              placeholder="e.g. San Francisco, Remote"
              className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
              Years of Experience
            </label>
            <input value={form.yearsExp} onChange={e => set("yearsExp", e.target.value)}
              placeholder="e.g. 5 years"
              className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">
              Current Salary <span className="text-[#9CA3AF] font-normal">(optional)</span>
            </label>
            <input value={form.currentSalary} onChange={e => set("currentSalary", e.target.value)}
              placeholder="e.g. 95000" type="number"
              className="w-full border border-[#E8E8E4] rounded-lg px-3 py-2 text-sm text-[#1C1C1E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6B9E78] transition-colors" />
          </div>
        </div>

        <div className="flex justify-end">
          <SageButton onClick={analyze} disabled={!form.offerAmount || !form.role} loading={loading} loadingText="Analyzing...">
            <DollarSign size={14} />Analyze Offer
          </SageButton>
        </div>
      </div>

      {error && <ErrorBanner msg={error} />}

      {result && (
        <div className="space-y-4 fade-up">
          {/* Verdict + counter offer */}
          <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Verdict */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Offer Assessment</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-[#1C1C1E]">{fmt(Number(form.offerAmount))}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border"
                    style={verdictStyle(result.verdict)}>
                    {verdictStyle(result.verdict).emoji} {result.verdictLabel}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Market range */}
              <div className="bg-[#F5F5F1] rounded-xl p-4 min-w-[180px]">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Market Range</p>
                {[
                  { label: "Low",  value: result.marketRange?.low,  color: "#9CA3AF" },
                  { label: "Mid",  value: result.marketRange?.mid,  color: "#6B9E78" },
                  { label: "High", value: result.marketRange?.high, color: "#2D7A5A" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#6B7280]">{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{fmt(value || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Counter offer */}
          <div className="bg-white rounded-xl border border-[#E8E8E4] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1">Recommended Counter</p>
                <p className="text-3xl font-bold text-[#6B9E78]">{fmt(result.counterOffer || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#9CA3AF]">Walk-away point</p>
                <p className="text-lg font-semibold text-[#9B3D38]">{fmt(result.walkAwayPoint || 0)}</p>
              </div>
            </div>

            {/* Counter script */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Negotiation Script</p>
                <button onClick={copyScript}
                  className="flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: copied ? SAGE_BG : "white", color: copied ? SAGE_TEXT : "#6B7280", borderColor: copied ? SAGE_BORDER : "#E8E8E4" }}>
                  {copied ? <><CheckCircle size={11} />Copied!</> : <><Copy size={11} />Copy Script</>}
                </button>
              </div>
              <div className="bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl p-4 text-sm text-[#1C1C1E] leading-relaxed whitespace-pre-wrap">
                {result.counterScript}
              </div>
            </div>
          </div>

          {/* Tips + other benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="💡 Negotiation Tips">
              <ul className="space-y-2.5">
                {result.negotiationTips?.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: SAGE_BG, color: SAGE_TEXT }}>{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="🎁 Also Negotiate">
              <div className="flex flex-wrap gap-2">
                {result.otherBenefitsToNegotiate?.map((b: string) => (
                  <SkillBadge key={b} label={b} variant="amber" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIClient() {
  const [activeTab, setActiveTab] = useState<TabId>("resume");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: SAGE_BG }}>
            <Sparkles size={18} style={{ color: SAGE }} />
          </div>
          <h1 className="text-2xl font-semibold text-[#1C1C1E] tracking-tight">AI Tools</h1>
        </div>
        <p className="text-[#6B7280] text-sm ml-12">AI-powered tools to help you land the job</p>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex items-center gap-1 bg-[#F5F5F1] rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={{
              background: activeTab === id ? "white" : "transparent",
              color: activeTab === id ? SAGE : "#6B7280",
              boxShadow: activeTab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "resume"    && <ResumeTab />}
      {activeTab === "match"     && <MatchTab />}
      {activeTab === "cover"     && <CoverLetterTab />}
      {activeTab === "interview" && <InterviewTab />}
      {activeTab === "decoder"   && <JDDecoderTab />}
      {activeTab === "salary"    && <SalaryTab />}
    </div>
  );
}
