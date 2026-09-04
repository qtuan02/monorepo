import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// No language pin here yet, unlike the Vite Template's setup file: this app has
// no i18n instance to pin. The i18n ticket adds one, and it lands here.
//
// Only `cleanup`: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it).
afterEach(() => {
  cleanup();
});
