import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import i18n from "~/libs/i18n";

// jsdom ships no `matchMedia`, and the app shell reaches it on first render:
// the sidebar primitive calls `useIsMobile`, so every component test that
// renders the layout would throw before asserting anything. The stub always
// reports "does not match", which is the desktop branch — a test that needs the
// mobile one overrides `window.matchMedia` itself.
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

// Importing the app's i18n wires the real message catalogs, so `t("auth.…")`
// resolves to the string a user reads instead of the key. The language is pinned
// because i18next would otherwise detect jsdom's `navigator.language`, making the
// same assertion resolve to `en` on one machine and `vi` on another.
beforeAll(async () => {
  await i18n.changeLanguage("vi");
});

// Only `cleanup` here: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it), so the
// `vi.clearAllMocks()` this hook used to carry would be a second spelling of a
// guarantee the runner already makes.
afterEach(() => {
  cleanup();
});
