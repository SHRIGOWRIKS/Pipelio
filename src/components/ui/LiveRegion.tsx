"use client";

import { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
}

// Announces messages to screen readers without visual output
export default function LiveRegion({ message, politeness = "polite" }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Global announcer hook — use this to announce dynamic changes
export function useAnnounce() {
  const ref = useRef<HTMLDivElement>(null);

  const announce = (message: string, politeness: "polite" | "assertive" = "polite") => {
    if (!ref.current) return;
    ref.current.setAttribute("aria-live", politeness);
    // Clear then set to trigger re-announcement
    ref.current.textContent = "";
    setTimeout(() => {
      if (ref.current) ref.current.textContent = message;
    }, 50);
  };

  const AnnouncerElement = () => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );

  return { announce, AnnouncerElement };
}
