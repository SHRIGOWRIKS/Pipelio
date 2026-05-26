export type JobStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export interface Job {
  id: string;
  userId: string;
  company: string;
  role: string;
  status: JobStatus;
  location?: string | null;
  salary?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
  appliedDate: Date | string;
  deadline?: Date | string | null;
  interviewRound?: string | null;
  resumeVersionId?: string | null;
  resumeVersion?: { id: string; name: string; fileUrl?: string | null } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  contacts?: Contact[];
  timeline?: Timeline[];
}

export interface Contact {
  id: string;
  jobId: string;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  createdAt: Date | string;
}

export interface Timeline {
  id: string;
  jobId: string;
  event: string;
  note?: string | null;
  date: Date | string;
  createdAt: Date | string;
}

// Pastel, clean, settled color palette
export const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  APPLIED: {
    label: "Applied",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  SCREENING: {
    label: "Screening",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  INTERVIEWING: {
    label: "Interviewing",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  OFFER: {
    label: "Offer",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};
