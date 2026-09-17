// Derived from hooks-ts useTimeout.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useEffect, useRef } from "react";

/** Runs a callback once after a delay, skipping it entirely when the delay is null. */
export function useTimeout(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);

  // Update the callback reference if it changes.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set the timeout.
  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }

    const id = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [delay]);
}
