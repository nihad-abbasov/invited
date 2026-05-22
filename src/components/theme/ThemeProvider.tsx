"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
/** What's actually being rendered right now (system gets resolved). */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** User's stored preference. */
  choice: ThemeChoice;
  /** What's actually applied. */
  resolved: ResolvedTheme;
  setChoice: (next: ThemeChoice) => void;
}

const STORAGE_KEY = "invited.theme.v1";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readSystem(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyAttribute(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Stays "system" until we've read storage so SSR and the first client paint
  // agree. The inline <head> script (see layout.tsx) is what prevents a flash
  // when the user has previously picked something other than "system".
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    let initial: ThemeChoice = "system";
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") initial = raw;
    } catch {
      /* ignore */
    }
    setChoiceState(initial);
    applyAttribute(initial);
    setResolved(initial === "system" ? readSystem() : initial);
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    applyAttribute(next);
    setResolved(next === "system" ? readSystem() : next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ choice, resolved, setChoice }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * String we drop into a <script> tag in <head>. Runs before React hydrates so
 * the first paint already has the correct background. Kept inline (no module
 * import) on purpose so it runs before any JS bundle loads.
 */
export const THEME_INIT_SCRIPT = `(() => {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();`;
