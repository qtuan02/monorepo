import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no `ResizeObserver` — react-virtuoso (the conversation/message
// lists) observes its scroller to size itself, and would throw on mount.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom ships no `matchMedia` either, and the conversation shell reaches it on
// first render (`useIsMobile`) — every test that mounts the route tree would
// throw before asserting anything. The stub always reports "does not match" —
// the desktop branch; a test that needs the mobile one overrides it.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// Only `cleanup` here: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it), so the
// `vi.clearAllMocks()` this hook used to carry would be a second spelling of a
// guarantee the runner already makes.
afterEach(() => {
  cleanup();
});
