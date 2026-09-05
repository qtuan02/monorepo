import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import i18n from "~/libs/i18n";

// The language is pinned rather than detected. jsdom has a `document`, so
// `createI18n` does register the browser detector here, and it answers
// `navigator.language` with the host's locale while carrying no cookie — so
// without this an assertion on user-visible text would pass or fail depending on
// whose machine ran it. Pinning `vi` also reproduces the server, where the
// detector is not registered at all and the singleton sits at the registry
// fallback. A test that needs the other language switches it itself and restores
// `vi` afterwards.
//
// Importing this module is also what initializes the singleton for the whole
// suite: in a real run that happens in `entry.client` / `entry.server`, neither
// of which a component test loads.
beforeAll(async () => {
  await i18n.changeLanguage("vi");
});

// Only `cleanup`: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it).
afterEach(() => {
  cleanup();
});
