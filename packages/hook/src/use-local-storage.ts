// Derived from hooks-ts useLocalStorage.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: guard SSR in the initializer (per upstream's unmerged refactor/change-structure branch)
import { useState } from "react";

/**
 * `[value, setValue]` persisted to `localStorage` as JSON under `key`. On the
 * server — no `window` — the initializer returns `initialValue` directly;
 * upstream reads `window.localStorage` unconditionally there, so a server
 * render throws a `ReferenceError` its own try/catch swallows into a
 * `console.error` on every request. `setValue` does not accept an updater
 * function.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "light");
 *
 * <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *   Toggle theme
 * </Button>;
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
