"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { Job } from "@/types";
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum([
    "APPLIED",
    "SCREENING",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ]),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().optional(),
  notes: z.string().optional(),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  resumeVersionId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface JobFormProps {
  job?: Job;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export default function JobForm({
  job,
  onSubmit,
  onCancel,
  loading,
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: job?.company || "",
      role: job?.role || "",
      status: job?.status || "APPLIED",
      location: job?.location || "",
      salary: job?.salary || "",
      jobUrl: job?.jobUrl || "",
      notes: job?.notes || "",
      appliedDate: job?.appliedDate
        ? new Date(job.appliedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      deadline: job?.deadline
        ? new Date(job.deadline).toISOString().split("T")[0]
        : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="company"
          label="Company *"
          placeholder="e.g. Google"
          error={errors.company?.message}
          {...register("company")}
        />
        <Input
          id="role"
          label="Role *"
          placeholder="e.g. Frontend Engineer"
          error={errors.role?.message}
          {...register("role")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="status"
          label="Status"
          options={statusOptions}
          {...register("status")}
        />
        <Input
          id="location"
          label="Location"
          placeholder="e.g. Remote, New York"
          {...register("location")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="salary"
          label="Salary Range"
          placeholder="e.g. $80k - $100k"
          {...register("salary")}
        />
        <Input
          id="jobUrl"
          label="Job URL"
          type="url"
          placeholder="https://..."
          {...register("jobUrl")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="appliedDate"
          label="Applied Date"
          type="date"
          {...register("appliedDate")}
        />
        <Input
          id="deadline"
          label="Deadline"
          type="date"
          {...register("deadline")}
        />
      </div>

      <Textarea
        id="notes"
        label="Notes"
        placeholder="Add any notes about this application..."
        rows={3}
        {...register("notes")}
      />

      {/* Resume version picker */}
      <ResumePicker
        value={watch("resumeVersionId") || ""}
        onChange={v => setValue("resumeVersionId", v)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {job ? "Update Job" : "Add Job"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Resume Picker ─────────────────────────────────────────────────────────────
function ResumePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [versions, setVersions] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);

  useEffect(() => {
    fetch("/api/vault")
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setVersions(d); })
      .catch(() => {});
  }, []);

  if (versions.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-[#1C1C1E] mb-1.5 flex items-center gap-1.5">
        <FileText size={13} className="text-[#6B9E78]" />
        Resume Version Submitted
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-[#E8E8E4] rounded-xl px-3 py-2 text-sm text-[#1C1C1E] bg-white focus:outline-none focus:border-[#6B9E78] transition-colors"
      >
        <option value="">— Not specified —</option>
        {versions.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}{v.isDefault ? " (default)" : ""}
          </option>
        ))}
      </select>
      <p className="text-xs text-[#9CA3AF] mt-1">
        Track which resume version you submitted · <a href="/vault" target="_blank" className="text-[#6B9E78] hover:underline">Manage resumes →</a>
      </p>
    </div>
  );
}
