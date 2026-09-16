"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/** The key the E2E specs seed and the toggle writes. */
export const THEME_STORAGE_KEY = "theme";

interface ThemeContextValue {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Runs before first paint, so the page never flashes light for a dark reader.
 * Plain ES5 in a string: it is inlined into the HTML, not compiled.
 */
const INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="dark")t="light";var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.classList.toggle("light",t==="light");r.style.colorScheme=t}catch(e){}})()`;

/**
 * Whether the document has hydrated once. Module-level on purpose: the init
 * script has done its job the moment the first render hydrates, and it must
 * not be rendered again by a *later* mount — the `[locale]` root layout
 * remounts on a language switch, and React 19 warns about a `<script>` created
 * during a client render ("Scripts inside React components are never
 * executed"). This is why the provider is the app's own rather than
 * `next-themes`, which renders its script on every mount and offers no way to
 * skip it.
 */
let hydrated = false;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Both classes, as next-themes did: the E2E specs and the dock read `light`.
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/**
 * The light/dark boundary: a class on `<html>` — the workspace Tailwind globals
 * declare `@custom-variant dark (&:where(.dark, .dark *))` — persisted under
 * `theme`, light by default, no system preference: the site opens light for
 * everyone and the dock's toggle is the only thing that changes it.
 *
 * It takes `children`, so everything inside stays a Server Component: a client
 * boundary wrapped **around** server output. Nothing here renders differently
 * per theme — the toggle's icons switch by the `dark:` variant — so the state
 * reading `dark` on the client while the server rendered `light` is not a
 * hydration mismatch; `suppressHydrationWarning` on `<html>` covers the class.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(readTheme);
  const [renderScript] = useState(() => !hydrated);

  // Re-applied on every mount, not only written by the script: a language
  // switch remounts the root layout and `<html>` comes back without the class
  // the script stamped, so the stored theme is put back the moment the new
  // tree mounts. First mount is a no-op — the script already did it.
  useEffect(() => {
    hydrated = true;
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (theme: Theme) => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    setResolvedTheme(theme);
  };

  return (
    <ThemeContext value={{ resolvedTheme, setTheme }}>
      {renderScript && (
        <script
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a constant, no user input
          dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }}
        />
      )}
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
