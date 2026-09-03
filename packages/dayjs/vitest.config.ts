import { defineConfig } from "vitest/config";

// Pinned before Vitest forks its test workers, which inherit this env. Vitest's
// own docs note that `test.env.TZ` does not reach the `threads`/`vmThreads`
// pools, so this module-scope assignment is what keeps the pin correct if the
// pool ever changes. A `TZ=UTC vitest` command prefix is not valid PowerShell
// syntax, and this repo is developed on Windows.
process.env.TZ = "UTC";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.{test,spec}.ts"],
    env: { TZ: "UTC" },

    // Vitest 5 flipped this default from false to true. Stated explicitly so a
    // reader can tell the value was chosen rather than inherited.
    clearMocks: true,
  },
});
