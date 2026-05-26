"use client";

import { useState, useRef, useEffect } from "react";
import { INTERVIEW_ROUNDS, getRoundById, getNextRound } from "@/lib/interview-rounds";
import { ChevronRight, ChevronDown } from "lucide-react";

interface RoundBadgeProps {
  jobId: string;
  currentRound: string | null | undefined;
  onRoundChange: (jobId: string, round: string | null) => void;
  compact?: boolean;
}

export default function RoundBadge({
  jobId, currentRound, onRoundChange, compact = false,
}: RoundBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const round = getRoundById(currentRound);
  const nextRound = getNextRound(currentRound);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextRound) return;
    onRoundChange(jobId, nextRound.id);
  };

  if (!round && !currentRound) {
    // No round set — show "Set round" button
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={e => { e.stopPropagation(); setOpen(!open); }}
          className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#6B9E78] transition-colors"
        >
          <span>Set round</span>
          <ChevronDown size={10} />
        </button>
        {open && <RoundDropdown jobId={jobId} onSelect={r => { onRoundChange(jobId, r); setOpen(false); }} onClose={() => setOpen(false)} />}
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center gap-1.5 ${compact ? "" : "flex-wrap"}`}>
        {/* Current round badge */}
        <button
          onClick={e => { e.stopPropagation(); setOpen(!open); }}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${round.bg} ${round.color} ${round.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${round.dot}`} />
          {compact ? round.label : `${round.label} — ${round.sublabel}`}
          <ChevronDown size={9} />
        </button>

        {/* Advance button */}
        {nextRound && (
          <button
            onClick={handleAdvance}
            className="inline-flex items-center gap-0.5 text-xs text-[#6B7280] hover:text-[#6B9E78] transition-colors"
            title={`Advance to ${nextRound.label}`}
          >
            <ChevronRight size={12} />
            <span className="hidden sm:inline">{nextRound.label}</span>
          </button>
        )}
      </div>

      {open && (
        <RoundDropdown
          jobId={jobId}
          currentRound={currentRound}
          onSelect={r => { onRoundChange(jobId, r); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function RoundDropdown({
  jobId, currentRound, onSelect, onClose,
}: {
  jobId: string;
  currentRound?: string | null;
  onSelect: (round: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-0 top-7 bg-white border border-[#E8E8E4] rounded-xl shadow-lg z-30 min-w-[220px] py-1 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-3 py-2 border-b border-[#F0F0EC]">
        Interview Round
      </p>
      {INTERVIEW_ROUNDS.map(r => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#F5F5F1] transition-colors ${
            currentRound === r.id ? "bg-[#F5F5F1]" : ""
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
          <div>
            <p className={`text-xs font-semibold ${r.color}`}>{r.label}</p>
            <p className="text-xs text-[#9CA3AF]">{r.sublabel}</p>
          </div>
          {currentRound === r.id && (
            <span className="ml-auto text-[#6B9E78] text-xs">✓</span>
          )}
        </button>
      ))}
      {currentRound && (
        <>
          <div className="border-t border-[#F0F0EC] mt-1" />
          <button
            onClick={() => onSelect(null)}
            className="w-full px-3 py-2 text-left text-xs text-[#9CA3AF] hover:bg-[#F5F5F1] transition-colors"
          >
            Clear round
          </button>
        </>
      )}
    </div>
  );
}
