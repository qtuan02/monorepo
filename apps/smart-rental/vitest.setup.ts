import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Only `cleanup` here: Vitest 5 clears mock history before each test on its own
// (`clearMocks` now defaults to true, and vitest.config.ts states it), so the
// `vi.clearAllMocks()` this hook used to carry would be a second spelling of a
// guarantee the runner already makes.
afterEach(() => {
  cleanup();
});
