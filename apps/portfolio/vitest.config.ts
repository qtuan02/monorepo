import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Set before Vitest forks its test workers, which inherit this env. It lives at
// module scope rather than only in `test.env` because that field is documented
// not to reach the `threads`/`vmThreads` pools. `TZ=UTC vitest` on the command
// line is not an option: that syntax is not valid in PowerShell, and this repo
// is developed on Windows.
process.env.TZ = "UTC";

export default defineConfig({
  // Next compiles the app itself; Vitest needs its own JSX transform, which is
  // the only reason this app depends on a Vite React plugin.
  plugins: [react()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    env: {
      TZ: "UTC",
      // `~/env` parses at module load, and half the modules under test import it
      // transitively. Values here are what a test run validates against — they
      // are not read from the repo-root `.env`, so a developer's local values
      // can never change an assertion.
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_BASE_DOMAIN_API: "http://localhost:8000",
      NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN: "http://localhost:3002",
    },
    // Vitest 5 flipped this default from `false` to `true`. Stated explicitly so
    // a reader can tell the value was chosen rather than inherited.
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      // Entry points and generated types have no behaviour of their own to
      // assert; the instrumentation files are three lines of wiring each.
      exclude: [
        "src/**/*.d.ts",
        "src/instrumentation.ts",
        "src/instrumentation-client.ts",
      ],
    },
  },
});
