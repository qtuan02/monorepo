import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";

import type { Theme } from "~/utils/theme-utils";
import {
  applyTheme,
  getEffectiveTheme,
  getStoredTheme,
  getSystemTheme,
  setStoredTheme,
  THEMES,
} from "~/utils/theme-utils";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
  isPending: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage or default to system
    return getStoredTheme() || THEMES.system;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() =>
    getEffectiveTheme(theme),
  );

  // Update effective theme when theme changes
  useEffect(() => {
    const newEffectiveTheme = getEffectiveTheme(theme);
    if (newEffectiveTheme !== effectiveTheme) {
      setEffectiveTheme(newEffectiveTheme);
      applyTheme(newEffectiveTheme);
    }
  }, [theme, effectiveTheme]);

  // Listen for system theme changes when using "system" theme
  useEffect(() => {
    if (theme !== THEMES.system) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const systemTheme = getSystemTheme();
      if (systemTheme !== effectiveTheme) {
        setEffectiveTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    // Use transition to prevent UI blocking
    startTransition(() => {
      setThemeState(newTheme);
      setStoredTheme(newTheme);
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, effectiveTheme, isPending }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
