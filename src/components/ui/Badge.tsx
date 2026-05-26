import { cn } from "@/lib/utils";
import { JobStatus, STATUS_CONFIG } from "@/types";

interface BadgeProps {
  status: JobStatus;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
