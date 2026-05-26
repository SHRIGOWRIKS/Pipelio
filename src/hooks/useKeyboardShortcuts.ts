import { useEffect } from "react";

interface Shortcuts {
  onNewJob?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({ onNewJob, onSearch, onEscape }: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.contentEditable === "true";

      if (isTyping && e.key !== "Escape") return;

      switch (e.key) {
        case "n":
        case "N":
          if (!isTyping) { e.preventDefault(); onNewJob?.(); }
          break;
        case "/":
          if (!isTyping) { e.preventDefault(); onSearch?.(); }
          break;
        case "Escape":
          onEscape?.();
          break;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onNewJob, onSearch, onEscape]);
}
