import { defineConfig } from "vitest/config";

// `cn` and `buildPaginationPages` are framework-free — string merging and
// arithmetic, no DOM and no setup file — so `node` is the whole environment. The
// primitives themselves are rendered from @monorepo/storybook's suite instead
// (see .agents/rules/testing-coverage.md); this runner is for the package's
// utils. TZ is pinned at module scope the way every other runner here pins it (a
// `TZ=UTC` command prefix is not valid PowerShell syntax, and this repo is
// developed on Windows).
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
