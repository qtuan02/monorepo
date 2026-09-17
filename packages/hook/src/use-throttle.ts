// Derived from hooks-ts useThrottle.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: throttle thật (upstream là debounce đội tên)
import { useEffect, useRef, useState } from "react";

/**
 * Throttles `value` so it updates at most once per `delay` ms: a change that
 * arrives once the window since the last update has closed applies right
 * away (leading), and the last change inside that window applies once it
 * closes (trailing).
 *
 * @example
 * const throttledScrollY = useThrottle(scrollY, 200);
 *
 * useEffect(() => {
 *   updateHeaderOffset(throttledScrollY);
 * }, [throttledScrollY]);
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number | null>(null);
  const isFirstRunRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // The initial render already carries `value` as `throttledValue` — this
    // run exists only to observe a LATER change, not to open a window.
    // biome-ignore lint/suspicious/noUnnecessaryConditions: flips to false below, across renders — invisible to Biome's per-render type inference
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    const now = Date.now();
    const sinceLastRun =
      lastRanRef.current === null ? null : now - lastRanRef.current;

    clearTimeout(timeoutRef.current);

    if (sinceLastRun === null || sinceLastRun >= delay) {
      // Leading: no window is open (or the last one closed) — apply now.
      lastRanRef.current = now;
      setThrottledValue(value);
    } else {
      // Trailing: still inside the window opened by the last leading update —
      // schedule the latest value for when it closes, replacing whatever was
      // scheduled before.
      timeoutRef.current = setTimeout(() => {
        lastRanRef.current = Date.now();
        setThrottledValue(value);
      }, delay - sinceLastRun);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [value, delay]);

  return throttledValue;
}
