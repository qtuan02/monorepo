import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// Set before Vitest forks its test workers, which inherit this env. It lives
// here rather than in vite.config.ts so `storybook dev` / `storybook build` keep
// running on the device's clock. `TZ=UTC vitest` on the command line is not an
// option: that syntax is not valid in PowerShell/cmd, and this repo is developed
// on Windows.
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
      // value was chosen rather than inherited. It is safe for the console.error
      // spy in test/stories.test.tsx, which is created inside that suite's own
      // `beforeEach` — after the runner's clear — and restored in `afterEach`.
      clearMocks: true,

      // Opening every trigger in a story re-renders the tree once per trigger,
      // and each portaled popup is awaited for up to 3s, so a slow test here
      // would read as a component defect rather than a budget. Measured on this
      // suite (148 tests, `--reporter=verbose`): the slowest test is the
      // date-picker mask at ~1.2s and the slowest story is `accordion > Single`
      // at ~1.0s — both inside the 5s default, but only ~4x under it, which is
      // thin once a cold CI worker runs three apps concurrently. Kept generous
      // deliberately: being wrong here costs a flaky red pipeline, whereas a
      // high ceiling only costs a genuinely hung `waitFor` reporting later.
      testTimeout: 30_000,
    },
  }),
);
