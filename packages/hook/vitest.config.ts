import { defineConfig } from "vitest/config";

// Set before Vitest forks its workers, which inherit this env. `test.env.TZ` is
// documented not to reach the `threads`/`vmThreads` pools, so the module-scope
// assignment is what keeps the pin correct if the pool ever changes. A `TZ=UTC`
// command prefix is not valid PowerShell syntax, and this repo is developed on
// Windows.
process.env.TZ = "UTC";

export default defineConfig({
  test: {
    // The hooks read `window.matchMedia` and `navigator.clipboard` from their
    // effects, so the suite needs a DOM. A spec about a server render opts back
    // out per file with a `@vitest-environment node` pragma, as
    // `packages/i18n` does.
    environment: "jsdom",
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    env: { TZ: "UTC" },
    // Vitest 5 flipped this default from `false` to `true`. Stated so a reader
    // can tell the value was chosen rather than inherited.
    clearMocks: true,
  },
});
