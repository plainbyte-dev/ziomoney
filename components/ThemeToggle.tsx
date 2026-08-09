"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  // The server always renders the light-mode icon (it has no way to know the
  // client's saved/system preference); swap to the real icon only after
  // mount so the two never visibly disagree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full border border-border p-2 text-heading/70 hover:bg-surface"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
