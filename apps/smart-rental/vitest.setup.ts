import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import i18n from "~/libs/i18n";

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
