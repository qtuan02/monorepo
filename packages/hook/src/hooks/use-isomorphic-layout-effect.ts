import { useEffect, useLayoutEffect } from "react";

/**
 * Returns the appropriate layout effect hook based on the environment.
 * Uses `useLayoutEffect` in the browser and `useEffect` on the server.
 *
 * This is useful for avoiding SSR warnings when using `useLayoutEffect`
 * in components that are rendered on both server and client.
 *
 * @returns The appropriate effect hook for the current environment
 *
 * @example
 * ```tsx
 * const useIsomorphicLayoutEffect = useIsomorphicLayoutEffect();
 *
 * useIsomorphicLayoutEffect(() => {
 *   // This will use useLayoutEffect in browser, useEffect on server
 *   window.scrollTo(0, 0);
 * }, []);
 * ```
 */
export function useIsomorphicLayoutEffect() {
  return typeof window !== "undefined" ? useLayoutEffect : useEffect;
}
