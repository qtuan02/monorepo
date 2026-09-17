// Derived from hooks-ts usePrevious.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
// patched: useState thay ref-in-render (react.dev; React Compiler refs lint)
import { useState } from "react";

/**
 * Returns the value from the previous render, or undefined on the first one.
 *
 * @example
 * const previousStatus = usePrevious(status);
 *
 * const justDischarged = previousStatus === "admitted" && status === "discharged";
 */
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);

  if (current !== value) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}
