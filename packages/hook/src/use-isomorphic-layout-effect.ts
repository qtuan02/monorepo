// Derived from hooks-ts useIsomorphicLayoutEffect.ts @ 9bd12431bb24b84d211f0d735c6bef79fe1be85a (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts
import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server — the same
 * measure-before-paint effect without React's server-side warning.
 *
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   setWidth(ref.current?.getBoundingClientRect().width ?? 0);
 * }, []);
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
