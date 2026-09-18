// Derived from hooks-ts useDarkMode.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: an `options` object ({ storageKey, className, target }) replacing the hard-coded key/class; dropped the redundant `darkMode` state that only mirrored `isDarkMode` (and, with it, the effect re-running on every render for a setter identity nobody needed); the initializer never touches `localStorage`/`matchMedia` with no `window`
import { useEffect, useState } from "react";

import { useLocalStorage } from "./use-local-storage";

export interface UseDarkModeOptions {
  storageKey?: string;
  className?: string;
  target?: HTMLElement;
}

function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * `[isDarkMode, toggle]` persisted to `localStorage` under `storageKey`
 * (default `"darkMode"`), falling back to `prefers-color-scheme` the first
 * time there is no saved value. Toggling adds/removes `className` (default
 * `"dark-mode"`) on `target` — read inside the effect, default
 * `document.body`, and removed again on unmount.
 *
 * @example
 * const [isDarkMode, toggle] = useDarkMode({
 *   className: "dark",
 *   target: document.documentElement,
 * });
 *
 * <Button onClick={toggle}>{isDarkMode ? "Light" : "Dark"} mode</Button>;
 */
export function useDarkMode(
  options?: UseDarkModeOptions,
): [boolean, () => void] {
  const storageKey = options?.storageKey ?? "darkMode";
  const className = options?.className ?? "dark-mode";

  // Lazy: `prefersDark()` must run once, at mount, not on every render — it
  // is only the fallback `useLocalStorage` falls back to when nothing is
  // saved yet, not a value it needs to see change.
  const [defaultValue] = useState(prefersDark);
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    storageKey,
    defaultValue,
  );

  useEffect(() => {
    const target = options?.target ?? document.body;
    target.classList.toggle(className, isDarkMode);

    return () => target.classList.remove(className);
  }, [isDarkMode, className, options?.target]);

  const toggle = () => setIsDarkMode(!isDarkMode);

  return [isDarkMode, toggle];
}
