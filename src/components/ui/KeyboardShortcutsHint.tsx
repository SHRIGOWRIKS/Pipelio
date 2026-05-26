"use client";

import { useState } from "react";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { key: "N",   desc: "Add new job" },
  { key: "/",   desc: "Focus search" },
  { key: "Esc", desc: "Close modal / dismiss" },
];

export default function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-2.5 bg-white border border-[#E8E8E4] rounded-xl shadow-sm text-[#9CA3AF] hover:text-[#6B7280] hover:shadow-md transition-all"
        title="Keyboard shortcuts"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl border border-[#E8E8E4] shadow-xl p-6 w-full max-w-xs"
            onClick={e => e.stopPropagation()}
            style={{ animation: "modalEnter 0.2s ease both" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1C1C1E] flex items-center gap-2">
                <Keyboard size={16} className="text-[#6B9E78]" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setOpen(false)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">{desc}</span>
                  <kbd className="px-2 py-1 bg-[#F5F5F1] border border-[#E8E8E4] rounded-md text-xs font-mono text-[#1C1C1E]">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
