import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// Set before Vitest forks its test workers, which inherit this env. It lives
// here rather than in vite.config.ts so `vite dev` / `vite build` keep running
// on the device's clock — pinning those to UTC would contradict the dates rules.
// `TZ=UTC vitest` on the command line is not an option: that syntax is not
// valid in PowerShell/cmd, and this repo is developed on Windows.
process.env.TZ = "UTC";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      globals: true,
      include: ["test/**/*.{test,spec}.{ts,tsx}"],
      env: { TZ: "UTC" },

      // Vitest 5 flipped this default from `false` to `true`: mock call history
      // is cleared before every test. Stated explicitly so a reader can tell the
      // value was chosen rather than inherited — and so nothing here quietly
      // starts depending on a mock's calls surviving into the next case.
      clearMocks: true,

      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/**/*.{ts,tsx}"],
        // Entry points, generated types, and the runtime-env shim have no
        // behaviour of their own to assert.
        exclude: ["src/index.tsx", "src/vite-env.d.ts", "src/**/*.d.ts"],
      },
    },
  }),
);
