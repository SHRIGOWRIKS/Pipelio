"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

const DURATION = 5000; // 5 seconds

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = DURATION,
}: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Progress bar animation
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setVisible(false);
        setTimeout(onClose, 300);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(enterTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle size={15} className="text-[#6B9E78] shrink-0" />,
    error:   <XCircle    size={15} className="text-[#9B3D38] shrink-0" />,
    info:    <AlertCircle size={15} className="text-[#6B9E78] shrink-0" />,
  };

  const progressColors = {
    success: "bg-[#6B9E78]",
    error:   "bg-[#9B3D38]",
    info:    "bg-[#6B9E78]",
  };

  const borderColors = {
    success: "border-l-[#6B9E78]",
    error:   "border-l-[#9B3D38]",
    info:    "border-l-[#6B9E78]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white border border-[#E8E4DF] border-l-4 rounded-xl shadow-sm min-w-[280px] max-w-sm transition-all duration-300",
        borderColors[type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="alert"
    >
      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[type]}
        <p className="text-sm text-[#1C1917] font-medium flex-1">{message}</p>
        <button
          onClick={handleClose}
          className="text-[#A8A29E] hover:text-[#78716C] transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#F0F0EC]">
        <div
          className={`h-0.5 transition-none ${progressColors[type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Toast container
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {/* Live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {toasts.length > 0 ? toasts[toasts.length - 1].message : ""}
      </div>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => onRemove(t.id)}
          />
        ))}
      </div>
    </>
  );
}
