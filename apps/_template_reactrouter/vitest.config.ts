import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// Set before Vitest forks its test workers, which inherit this env. It lives
// here rather than in vite.config.ts so `react-router dev` / `react-router
// build` keep running on the device's clock — pinning those to UTC would
// contradict the dates rules. `TZ=UTC vitest` on the command line is not an
// option: that syntax is not valid in PowerShell/cmd, and this repo is
// developed on Windows.
process.env.TZ = "UTC";

// Merging the app's own Vite config is what makes `~/*` and `envDir: "../../"`
// hold in tests, so `import.meta.env.PUBLIC_*` resolves exactly as it does in a
// build. It also picks up the `VITEST` fork in that file, which swaps
// `reactRouter()` out for the plain React plugin — a route module cannot be
// rendered by `createRoutesStub` while the framework plugin is transforming it.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      globals: true,
      include: ["test/**/*.{test,spec}.{ts,tsx}"],
      env: {
        TZ: "UTC",
        // `src/env.ts` parses at module load and every route module reaches it
        // transitively. The server half is read off `process.env`, which a bare
        // `vitest run` does not carry — the app's own scripts get it from
        // dotenv-cli, and there is no dotenv-cli here. Pinned rather than read
        // from the repo-root `.env` so a developer's local secret can never
        // change an assertion.
        TEMPLATE_REACTROUTER_SESSION_SECRET: "test-session-secret",
      },

      // Vitest 5 flipped this default from `false` to `true`: mock call history
      // is cleared before every test. Stated explicitly so a reader can tell the
      // value was chosen rather than inherited.
      clearMocks: true,

      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/**/*.{ts,tsx}"],
        // The two entry files are framework wiring with no branch of their own,
        // and `routes.ts` is a declaration the build reads rather than code.
        exclude: [
          "src/entry.client.tsx",
          "src/entry.server.tsx",
          "src/routes.ts",
          "src/**/*.d.ts",
        ],
      },
    },
  }),
);
