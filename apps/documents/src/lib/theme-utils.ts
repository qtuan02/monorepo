export const THEMES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const THEME_STORAGE_KEY = "app-theme-preference";

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && Object.values(THEMES).includes(stored as Theme)) {
    return stored as Theme;
  }
  return null;
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

export function applyTheme(theme: "light" | "dark"): void {
  const root = document.documentElement;

  // Temporarily disable transitions for instant theme switch
  const css = document.createElement("style");
  css.textContent = `* {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
  }`;
  document.head.appendChild(css);

  // Use requestAnimationFrame to prevent blocking the UI
  requestAnimationFrame(() => {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Re-enable transitions after theme is applied
    requestAnimationFrame(() => {
      document.head.removeChild(css);
    });
  });
}
