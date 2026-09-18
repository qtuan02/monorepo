import { vi } from "vitest";

type IntersectionEntry = Pick<IntersectionObserverEntry, "isIntersecting">;
type IntersectionCallback = (entries: IntersectionEntry[]) => void;

/**
 * jsdom ships no `IntersectionObserver`. The mock captures the callback
 * `useOnScreen` registers so a spec can report an intersection change
 * directly, and spies on `observe`/`unobserve` so a mount and an unmount's
 * cleanup can both be asserted against them.
 */
export function installIntersectionObserver() {
  let callback: IntersectionCallback | undefined;
  const observe = vi.fn();
  const unobserve = vi.fn();

  class IntersectionObserverMock {
    constructor(cb: IntersectionCallback) {
      callback = cb;
    }

    observe = observe;
    unobserve = unobserve;
    disconnect = vi.fn();
    takeRecords = () => [];
  }

  window.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;

  return {
    observe,
    unobserve,
    triggerIntersecting(isIntersecting: boolean) {
      callback?.([{ isIntersecting }]);
    },
  };
}
