// Derived from hooks-ts useSessionStorage.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: guard SSR trong initializer (theo nhánh refactor/change-structure upstream)
import { useEffect, useState } from "react";

type UseSessionStorageReturn<T> = [T, (value: T) => void, () => void];

/**
 * `[value, setValue, removeValue]` persisted to `sessionStorage` as JSON under
 * `key`; an effect seeds the key with `initialValue` the first time it is
 * missing. On the server — no `window` — the initializer returns
 * `initialValue` with no thrown error.
 *
 * @example
 * const [draft, setDraft, clearDraft] = useSessionStorage("draft", "");
 *
 * <Button onClick={clearDraft}>Discard draft</Button>;
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): UseSessionStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to sessionStorage", error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from sessionStorage", error);
    }
  };

  useEffect(() => {
    const item = sessionStorage.getItem(key);
    if (item === null) {
      sessionStorage.setItem(key, JSON.stringify(initialValue));
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
