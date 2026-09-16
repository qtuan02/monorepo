import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** The key the inline script in `index.html` and the E2E spec read too. */
export const THEME_STORAGE_KEY = "theme";

interface ThemeContextValue {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** The stored choice, else the system preference — the same order `index.html` decides in. */
function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Storage blocked: fall through to the system preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * The light/dark boundary, ported from `apps/portfolio`: a class on `<html>` —
 * the workspace Tailwind globals declare `@custom-variant dark
 * (&:where(.dark, .dark *))` — persisted under `theme`, and following
 * `prefers-color-scheme` until the toggle is pressed once. No `next-themes`
 * and no store: it is a context, an effect and one `localStorage` key.
 *
 * The class is stamped before React runs as well, by the inline script in
 * `index.html`, so a dark reader never sees the light ground flash while the
 * bundle loads; the effect here re-applies it on every change.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (theme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage blocked: the choice still holds for this page.
    }
    setResolvedTheme(theme);
  };

  return (
    <ThemeContext value={{ resolvedTheme, setTheme }}>{children}</ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
