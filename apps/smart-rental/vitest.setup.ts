import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom ships no `matchMedia`, and the shell reaches it on first render: the
// sidebar primitive calls `useIsMobile`, so every test that mounts the route
// tree would throw before asserting anything. The stub always reports "does not
// match" — the desktop branch; a test that needs the mobile one overrides it.
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

// jsdom has no `ResizeObserver` either; cmdk (the `command` primitive) observes
// its list to size the dialog, so the palette would throw on open.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// …and no layout, so `scrollIntoView` is missing too — cmdk calls it on the
// selected item.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Only `cleanup` here: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it), so the
// `vi.clearAllMocks()` this hook used to carry would be a second spelling of a
// guarantee the runner already makes.
afterEach(() => {
  cleanup();
});
