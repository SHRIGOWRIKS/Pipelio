export const INTERVIEW_ROUNDS = [
  { id: "r1", label: "Round 1",  sublabel: "Recruiter Screen",    color: "text-[#5B4B8A]", bg: "bg-[#F3F0FA]", border: "border-[#D4C8F0]", dot: "bg-[#5B4B8A]" },
  { id: "r2", label: "Round 2",  sublabel: "Technical Phone",     color: "text-[#1C1C1E]", bg: "bg-[#F5F5F1]", border: "border-[#E8E8E4]", dot: "bg-[#6B7280]" },
  { id: "r3", label: "Round 3",  sublabel: "Take-home / Coding",  color: "text-[#92681A]", bg: "bg-[#FEF9EE]", border: "border-[#F5DFA0]", dot: "bg-[#92681A]" },
  { id: "r4", label: "Round 4",  sublabel: "System Design",       color: "text-[#4A7C59]", bg: "bg-[#EEF4F0]", border: "border-[#C8DDD0]", dot: "bg-[#6B9E78]" },
  { id: "r5", label: "Round 5",  sublabel: "Hiring Manager",      color: "text-[#9B5A38]", bg: "bg-[#FEF3EE]", border: "border-[#F5D4C3]", dot: "bg-[#9B5A38]" },
  { id: "r6", label: "Final",    sublabel: "Panel / Exec",        color: "text-[#9B3D38]", bg: "bg-[#FDF0EF]", border: "border-[#F5C6C3]", dot: "bg-[#9B3D38]" },
] as const;

export type RoundId = typeof INTERVIEW_ROUNDS[number]["id"];

export function getRoundById(id: string | null | undefined) {
  return INTERVIEW_ROUNDS.find(r => r.id === id) || null;
}

export function getNextRound(currentId: string | null | undefined) {
  const idx = INTERVIEW_ROUNDS.findIndex(r => r.id === currentId);
  if (idx === -1) return INTERVIEW_ROUNDS[0]; // default to Round 1
  if (idx >= INTERVIEW_ROUNDS.length - 1) return null; // already at final
  return INTERVIEW_ROUNDS[idx + 1];
}

export function getRoundLabel(id: string | null | undefined): string {
  const round = getRoundById(id);
  if (!round) return "";
  return `${round.label} — ${round.sublabel}`;
}
