"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read saved preference or system preference
    const saved = localStorage.getItem("pipelio-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    applyTheme(isDark);
    setDark(isDark);
  }, []);

  const applyTheme = (isDark: boolean) => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  const toggle = () => {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    localStorage.setItem("pipelio-theme", next ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-colors"
      style={{
        color: "var(--text-secondary)",
        background: "transparent",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
