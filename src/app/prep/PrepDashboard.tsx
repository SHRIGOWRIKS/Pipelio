"use client";

import { useState, useEffect } from "react";
import { PrepLevel, LEVELS } from "@/lib/prep-roles";
import {
  ArrowLeft, Sparkles, BookOpen, Code2, Layout,
  Users, Map, Bookmark, BookmarkCheck, CheckCircle,
  Circle, ChevronDown, ChevronUp, Loader2, RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface PrepDashboardProps {
  role: string;
  roleLabel: string;
  roleIcon: string;
  level: PrepLevel;
  onBack: () => void;
}

type TabId = "roadmap" | "questions" | "coding" | "system" | "behavioral";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "roadmap",    label: "Roadmap",       icon: Map       },
  { id: "questions",  label: "Questions",     icon: BookOpen  },
  { id: "coding",     label: "Coding",        icon: Code2     },
  { id: "system",     label: "System Design", icon: Layout    },
  { id: "behavioral", label: "Behavioral",    icon: Users     },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
function DiffBadge({ diff }: { diff: string }) {
  const styles: Record<string, string> = {
    easy:   "bg-[#EEF4F0] text-[#4A7C59] border-[#C8DDD0]",
    medium: "bg-[#FEF9EE] text-[#92681A] border-[#F5DFA0]",
    hard:   "bg-[#FDF0EF] text-[#9B3D38] border-[#F5C6C3]",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[diff] || styles.medium}`}>
      {diff}
    </span>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-[#E8E8E4] border-t-[#6B9E78] animate-spin" role="status" aria-label="Loading" />
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  );
}

function GenerateButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 bg-[#6B9E78] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A8A67] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      {loading ? "Generating..." : label}
    </button>
  );
}

// ── Roadmap Tab ───────────────────────────────────────────────────────────────
function RoadmapTab({ role, level, roleLabel }: { role: string; level: string; roleLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, roleLabel, level, category: "roadmap" }),
      });
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch { /* non-json */ }
      if (res.ok && json.data) { setData(json.data); setError(""); }
      else { setError(json.error || "Generation failed. Please try again."); }
    } catch {
      setError("Network error. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`/api/prep/progress?role=${role}&level=${level}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) {
          const map: Record<string, boolean> = {};
          d.forEach((p: any) => { map[p.topic] = p.done; });
          setProgress(map);
        }
      })
      .catch(() => {});
  }, [role, level]);

  const toggleTopic = async (topic: string) => {
    const done = !progress[topic];
    setProgress(prev => ({ ...prev, [topic]: done }));
    await fetch("/api/prep/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, level, topic, done }),
    });
  };

  const doneCount = Object.values(progress).filter(Boolean).length;
  const totalCount = data?.topics?.length || 0;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center">
          <Map size={28} className="text-[#6B9E78]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[#1C1C1E] mb-1">Generate Your Study Roadmap</h3>
          <p className="text-sm text-[#6B7280] mb-5 max-w-sm">
            Get a personalized study plan with topics, priorities, and time estimates for {roleLabel}.
          </p>
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          <GenerateButton onClick={generate} loading={loading} label="Generate Roadmap" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState message="Building your roadmap..." />;

  const priorityOrder = { "must-know": 0, "important": 1, "good-to-know": 2 };
  const priorityStyle: Record<string, string> = {
    "must-know":    "bg-[#FDF0EF] text-[#9B3D38] border-[#F5C6C3]",
    "important":    "bg-[#FEF9EE] text-[#92681A] border-[#F5DFA0]",
    "good-to-know": "bg-[#F5F5F1] text-[#6B7280] border-[#E8E8E4]",
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-white rounded-xl border border-[#E8E8E4] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1C1C1E]">Study Plan</h3>
            <p className="text-sm text-[#6B7280] mt-0.5">{data.studyPlan}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#6B9E78]">{doneCount}/{totalCount}</p>
            <p className="text-xs text-[#9CA3AF]">topics done</p>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="w-full bg-[#F0F0EC] rounded-full h-2">
            <div className="bg-[#6B9E78] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / totalCount) * 100}%` }} />
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280]">
          <span>⏱ ~{data.totalWeeks} weeks</span>
          <span>📚 {totalCount} topics</span>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {[...data.topics].sort((a: any, b: any) =>
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
        ).map((topic: any) => (
          <div key={topic.id} className={`bg-white rounded-xl border border-[#E8E8E4] p-4 transition-all ${progress[topic.title] ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggleTopic(topic.title)} className="mt-0.5 shrink-0">
                {progress[topic.title]
                  ? <CheckCircle size={18} className="text-[#6B9E78]" />
                  : <Circle size={18} className="text-[#D1D5DB]" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className={`font-semibold text-sm ${progress[topic.title] ? "line-through text-[#9CA3AF]" : "text-[#1C1C1E]"}`}>
                    {topic.title}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityStyle[topic.priority] || priorityStyle["important"]}`}>
                    {topic.priority}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">~{topic.estimatedHours}h</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-2">{topic.description}</p>
                <div className="flex flex-wrap gap-1">
                  {topic.subtopics?.map((sub: string) => (
                    <span key={sub} className="text-xs bg-[#F5F5F1] text-[#6B7280] px-2 py-0.5 rounded-md">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resources */}
      {data.keyResources?.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8E8E4] p-5">
          <h3 className="font-bold text-[#1C1C1E] mb-3 text-sm">📚 Key Resources</h3>
          <div className="space-y-2">
            {data.keyResources.map((r: any, i: number) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#6B9E78] hover:underline">
                <span className="text-xs bg-[#EEF4F0] text-[#4A7C59] px-2 py-0.5 rounded-full">{r.type}</span>
                {r.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={generate} className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          <RefreshCw size={12} /> Regenerate
        </button>
      </div>
    </div>
  );
}

// ── Questions Tab ─────────────────────────────────────────────────────────────
function QuestionsTab({ role, level, roleLabel }: { role: string; level: string; roleLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard" | "bookmarked">("all");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, roleLabel, level, category: "questions" }),
      });
      const json = await res.json();
      if (res.ok && json.data) { setData(json.data); setRevealed(new Set()); }
      else { setError(json.error || "Generation failed. Please try again."); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetch(`/api/prep/bookmarks?role=${role}&level=${level}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) {
          setBookmarks(new Set(d.filter((b: any) => b.category === "questions").map((b: any) => b.questionId)));
        }
      })
      .catch(() => {});
  }, [role, level]);

  const toggleBookmark = async (q: any) => {
    const isBookmarked = bookmarks.has(q.id);
    if (isBookmarked) {
      await fetch("/api/prep/bookmarks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: q.id }) });
      setBookmarks(prev => { const s = new Set(prev); s.delete(q.id); return s; });
    } else {
      await fetch("/api/prep/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, level, category: "questions", questionId: q.id, question: q.question, answer: q.answer }) });
      setBookmarks(prev => new Set([...prev, q.id]));
    }
  };

  const filtered = data?.questions?.filter((q: any) => {
    if (filter === "bookmarked") return bookmarks.has(q.id);
    if (filter === "all") return true;
    return q.difficulty === filter;
  }) || [];

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center">
          <BookOpen size={28} className="text-[#6B9E78]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[#1C1C1E] mb-1">Generate Interview Questions</h3>
          <p className="text-sm text-[#6B7280] mb-5 max-w-sm">15 role-specific questions with detailed answers, follow-ups, and tips.</p>
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          <GenerateButton onClick={generate} loading={loading} label="Generate Questions" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState message="Generating questions..." />;

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "easy", "medium", "hard", "bookmarked"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${
              filter === f ? "bg-[#1C1C1E] text-white border-[#1C1C1E]" : "bg-white text-[#6B7280] border-[#E8E8E4]"
            }`}>
            {f === "bookmarked" ? "🔖 Saved" : f}
            {f !== "bookmarked" && f !== "all" && (
              <span className="ml-1 opacity-60">{data?.questions?.filter((q: any) => q.difficulty === f).length}</span>
            )}
          </button>
        ))}
        <button onClick={generate} className="ml-auto flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280]">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-sm text-[#9CA3AF]">No questions in this filter</p>
      ) : (
        filtered.map((q: any) => (
          <div key={q.id} className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <DiffBadge diff={q.difficulty} />
                  <span className="text-xs text-[#9CA3AF] bg-[#F5F5F1] px-2 py-0.5 rounded-full">{q.topic}</span>
                </div>
                <button onClick={() => toggleBookmark(q)} className="shrink-0 text-[#9CA3AF] hover:text-[#6B9E78] transition-colors">
                  {bookmarks.has(q.id) ? <BookmarkCheck size={16} className="text-[#6B9E78]" /> : <Bookmark size={16} />}
                </button>
              </div>
              <p className="font-semibold text-[#1C1C1E] text-sm leading-relaxed">{q.question}</p>

              {!revealed.has(q.id) ? (
                <button onClick={() => setRevealed(prev => new Set([...prev, q.id]))}
                  className="mt-3 text-xs text-[#6B9E78] font-semibold hover:underline">
                  Show Answer ↓
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="bg-[#EEF4F0] border border-[#C8DDD0] rounded-lg p-4">
                    <p className="text-xs font-bold text-[#4A7C59] uppercase tracking-wide mb-2">Answer</p>
                    <p className="text-sm text-[#1C1C1E] leading-relaxed">{q.answer}</p>
                  </div>
                  {q.followUp && (
                    <div className="bg-[#FEF9EE] border border-[#F5DFA0] rounded-lg p-3">
                      <p className="text-xs font-bold text-[#92681A] uppercase tracking-wide mb-1">Follow-up</p>
                      <p className="text-sm text-[#92681A]">{q.followUp}</p>
                    </div>
                  )}
                  {q.tip && (
                    <p className="text-xs text-[#6B7280] flex items-start gap-1.5">
                      <span className="text-[#6B9E78] font-bold shrink-0">💡</span>{q.tip}
                    </p>
                  )}
                  <button onClick={() => setRevealed(prev => { const s = new Set(prev); s.delete(q.id); return s; })}
                    className="text-xs text-[#9CA3AF] hover:text-[#6B7280]">Hide ↑</button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Coding Tab ────────────────────────────────────────────────────────────────
function CodingTab({ role, level, roleLabel }: { role: string; level: string; roleLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<Set<string>>(new Set());
  const [userCode, setUserCode] = useState<Record<string, string>>({});

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, roleLabel, level, category: "coding" }),
      });
      const json = await res.json();
      if (res.ok && json.data) setData(json.data);
      else { setError(json.error || "Generation failed. Please try again."); }
    } finally { setLoading(false); }
  };

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center">
          <Code2 size={28} className="text-[#6B9E78]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[#1C1C1E] mb-1">Generate Coding Challenges</h3>
          <p className="text-sm text-[#6B7280] mb-5 max-w-sm">8 role-specific coding problems with hints, solutions, and explanations.</p>
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          <GenerateButton onClick={generate} loading={loading} label="Generate Problems" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState message="Generating coding problems..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={generate} className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280]">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>

      {data?.problems?.map((p: any) => (
        <div key={p.id} className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
          {/* Header */}
          <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} aria-expanded={expanded === p.id}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAF8] transition-colors">
            <div className="flex items-center gap-3">
              <DiffBadge diff={p.difficulty} />
              <span className="font-semibold text-[#1C1C1E] text-sm">{p.title}</span>
              <span className="text-xs text-[#9CA3AF] bg-[#F5F5F1] px-2 py-0.5 rounded-full hidden sm:block">{p.topic}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-[#9CA3AF] hidden sm:block">{p.language}</span>
              {expanded === p.id ? <ChevronUp size={15} className="text-[#9CA3AF]" /> : <ChevronDown size={15} className="text-[#9CA3AF]" />}
            </div>
          </button>

          {expanded === p.id && (
            <div className="border-t border-[#F0F0EC] p-5 space-y-4">
              {/* Problem */}
              <div>
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Problem</p>
                <p className="text-sm text-[#1C1C1E] leading-relaxed whitespace-pre-wrap">{p.description}</p>
              </div>

              {/* Examples */}
              {p.examples?.map((ex: any, i: number) => (
                <div key={i} className="bg-[#F5F5F1] rounded-lg p-3 font-mono text-xs">
                  <p className="text-[#6B7280] mb-1">Example {i + 1}:</p>
                  <p><span className="text-[#4A7C59]">Input:</span> {ex.input}</p>
                  <p><span className="text-[#4A7C59]">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="text-[#9CA3AF] mt-1">{ex.explanation}</p>}
                </div>
              ))}

              {/* Hints */}
              {p.hints?.length > 0 && (
                <div className="bg-[#FEF9EE] border border-[#F5DFA0] rounded-lg p-3">
                  <p className="text-xs font-bold text-[#92681A] uppercase tracking-wide mb-2">Hints</p>
                  {p.hints.map((h: string, i: number) => (
                    <p key={i} className="text-xs text-[#92681A] flex items-start gap-1.5 mb-1">
                      <span className="font-bold shrink-0">{i + 1}.</span>{h}
                    </p>
                  ))}
                </div>
              )}

              {/* Code editor */}
              <div>
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Your Solution</p>
                <div className="rounded-xl overflow-hidden border border-[#E8E8E4]">
                  <MonacoEditor
                    height="200px"
                    language={p.language === "javascript" ? "javascript" : p.language === "python" ? "python" : "java"}
                    value={userCode[p.id] || `// Write your solution here\n`}
                    onChange={v => setUserCode(prev => ({ ...prev, [p.id]: v || "" }))}
                    theme="vs-light"
                    options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 } }}
                  />
                </div>
              </div>

              {/* Solution */}
              {!showSolution.has(p.id) ? (
                <button onClick={() => setShowSolution(prev => new Set([...prev, p.id]))}
                  className="text-xs text-[#6B9E78] font-semibold hover:underline">
                  Show Solution ↓
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Solution</p>
                    <div className="rounded-xl overflow-hidden border border-[#C8DDD0]">
                      <MonacoEditor
                        height="200px"
                        language={p.language === "javascript" ? "javascript" : p.language === "python" ? "python" : "java"}
                        value={p.solution}
                        theme="vs-light"
                        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 12 } }}
                      />
                    </div>
                  </div>
                  <div className="bg-[#EEF4F0] border border-[#C8DDD0] rounded-lg p-4">
                    <p className="text-xs font-bold text-[#4A7C59] uppercase tracking-wide mb-2">Explanation</p>
                    <p className="text-sm text-[#1C1C1E] leading-relaxed">{p.explanation}</p>
                    <div className="flex gap-4 mt-3 text-xs text-[#6B7280]">
                      <span>⏱ Time: <strong>{p.timeComplexity}</strong></span>
                      <span>💾 Space: <strong>{p.spaceComplexity}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── System Design Tab ─────────────────────────────────────────────────────────
function SystemTab({ role, level, roleLabel }: { role: string; level: string; roleLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, roleLabel, level, category: "system" }),
      });
      const json = await res.json();
      if (res.ok && json.data) setData(json.data);
      else { setError(json.error || "Generation failed. Please try again."); }
    } finally { setLoading(false); }
  };

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center">
          <Layout size={28} className="text-[#6B9E78]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[#1C1C1E] mb-1">Generate System Design Questions</h3>
          <p className="text-sm text-[#6B7280] mb-5 max-w-sm">6 system design questions with approach, considerations, and sample answers.</p>
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          <GenerateButton onClick={generate} loading={loading} label="Generate Questions" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState message="Generating system design questions..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={generate} className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280]">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>
      {data?.questions?.map((q: any) => (
        <div key={q.id} className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
          <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} aria-expanded={expanded === q.id}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAF8] transition-colors">
            <div className="flex items-center gap-3">
              <DiffBadge diff={q.difficulty} />
              <span className="font-semibold text-[#1C1C1E] text-sm">{q.question}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#9CA3AF] hidden sm:block">{q.timeLimit}</span>
              {expanded === q.id ? <ChevronUp size={15} className="text-[#9CA3AF]" /> : <ChevronDown size={15} className="text-[#9CA3AF]" />}
            </div>
          </button>
          {expanded === q.id && (
            <div className="border-t border-[#F0F0EC] p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F5F5F1] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Approach</p>
                  <p className="text-sm text-[#1C1C1E] leading-relaxed whitespace-pre-wrap">{q.approach}</p>
                </div>
                <div className="bg-[#F5F5F1] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Key Considerations</p>
                  <ul className="space-y-1">
                    {q.considerations?.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                        <span className="text-[#6B9E78] font-bold shrink-0">·</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-[#EEF4F0] border border-[#C8DDD0] rounded-lg p-4">
                <p className="text-xs font-bold text-[#4A7C59] uppercase tracking-wide mb-2">Key Components</p>
                <div className="flex flex-wrap gap-2">
                  {q.keyComponents?.map((c: string) => (
                    <span key={c} className="text-xs bg-white border border-[#C8DDD0] text-[#4A7C59] px-2.5 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-[#E8E8E4] rounded-lg p-4">
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Sample Answer</p>
                <p className="text-sm text-[#1C1C1E] leading-relaxed">{q.sampleAnswer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Behavioral Tab ────────────────────────────────────────────────────────────
function BehavioralTab({ role, level, roleLabel }: { role: string; level: string; roleLabel: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prep/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, roleLabel, level, category: "behavioral" }),
      });
      const json = await res.json();
      if (res.ok && json.data) setData(json.data);
      else { setError(json.error || "Generation failed. Please try again."); }
    } finally { setLoading(false); }
  };

  const categoryColors: Record<string, string> = {
    Leadership: "bg-[#F3F0FA] text-[#5B4B8A] border-[#D4C8F0]",
    Conflict:   "bg-[#FDF0EF] text-[#9B3D38] border-[#F5C6C3]",
    Failure:    "bg-[#FEF3EE] text-[#9B5A38] border-[#F5D4C3]",
    Achievement:"bg-[#EEF4F0] text-[#4A7C59] border-[#C8DDD0]",
    Teamwork:   "bg-[#EEF4F0] text-[#4A7C59] border-[#C8DDD0]",
    Growth:     "bg-[#EEF4F0] text-[#4A7C59] border-[#C8DDD0]",
  };

  if (!data && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-[#EEF4F0] rounded-2xl flex items-center justify-center">
          <Users size={28} className="text-[#6B9E78]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[#1C1C1E] mb-1">Generate Behavioral Questions</h3>
          <p className="text-sm text-[#6B7280] mb-5 max-w-sm">10 behavioral questions with STAR framework templates and sample answers.</p>
          {error && <p className="text-xs text-[#9B3D38] mb-3 bg-[#FDF0EF] border border-[#F5C6C3] rounded-lg px-3 py-2">{error}</p>}
          <GenerateButton onClick={generate} loading={loading} label="Generate Questions" />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingState message="Generating behavioral questions..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={generate} className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B7280]">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>
      {data?.questions?.map((q: any) => (
        <div key={q.id} className="bg-white rounded-xl border border-[#E8E8E4] overflow-hidden">
          <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} aria-expanded={expanded === q.id}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAF8] transition-colors">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${categoryColors[q.category] || "bg-[#F5F5F1] text-[#6B7280] border-[#E8E8E4]"}`}>
                {q.category}
              </span>
              <span className="font-semibold text-[#1C1C1E] text-sm">{q.question}</span>
            </div>
            {expanded === q.id ? <ChevronUp size={15} className="text-[#9CA3AF] shrink-0" /> : <ChevronDown size={15} className="text-[#9CA3AF] shrink-0" />}
          </button>
          {expanded === q.id && (
            <div className="border-t border-[#F0F0EC] p-5 space-y-4">
              <div className="bg-[#F5F5F1] rounded-lg p-4">
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-2">Why they ask this</p>
                <p className="text-sm text-[#6B7280]">{q.whyAsked}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(q.starTemplate || {}).map(([key, val]) => (
                  <div key={key} className="bg-white border border-[#E8E8E4] rounded-lg p-3">
                    <p className="text-xs font-bold text-[#6B9E78] uppercase tracking-wide mb-1">{key}</p>
                    <p className="text-xs text-[#6B7280]">{val as string}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#EEF4F0] border border-[#C8DDD0] rounded-lg p-4">
                <p className="text-xs font-bold text-[#4A7C59] uppercase tracking-wide mb-2">Sample Answer</p>
                <p className="text-sm text-[#1C1C1E] leading-relaxed">{q.sampleAnswer}</p>
              </div>
              {q.tip && (
                <p className="text-xs text-[#6B7280] flex items-start gap-1.5">
                  <span className="text-[#6B9E78] font-bold shrink-0">💡</span>{q.tip}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main PrepDashboard ────────────────────────────────────────────────────────
export default function PrepDashboard({ role, roleLabel, roleIcon, level, onBack }: PrepDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("roadmap");
  const levelData = LEVELS.find(l => l.id === level);

  return (
    <div>
      {/* Back + header */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C1C1E] mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to roles
      </button>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{roleIcon}</span>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">{roleLabel}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-[#6B7280]">{levelData?.emoji} {levelData?.label}</span>
            <span className="text-[#E8E8E4]">·</span>
            <span className="text-sm text-[#6B7280]">AI-powered prep</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F5F5F1] rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-white text-[#6B9E78] shadow-sm"
                : "text-[#6B7280] hover:text-[#1C1C1E]"
            }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "roadmap"    && <RoadmapTab    role={role} level={level} roleLabel={roleLabel} />}
      {activeTab === "questions"  && <QuestionsTab  role={role} level={level} roleLabel={roleLabel} />}
      {activeTab === "coding"     && <CodingTab     role={role} level={level} roleLabel={roleLabel} />}
      {activeTab === "system"     && <SystemTab     role={role} level={level} roleLabel={roleLabel} />}
      {activeTab === "behavioral" && <BehavioralTab role={role} level={level} roleLabel={roleLabel} />}
    </div>
  );
}
