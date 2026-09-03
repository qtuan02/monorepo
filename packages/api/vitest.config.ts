import { defineConfig } from "vitest/config";

// The services here are plain classes over an injected `HttpClient`, so this
// package needs no DOM and no setup file — `node` is the whole environment. TZ
// is pinned the same way the apps pin it, at module scope so it survives a pool
// change (a `TZ=UTC` command prefix is not valid PowerShell syntax, and this
// repo is developed on Windows).
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
