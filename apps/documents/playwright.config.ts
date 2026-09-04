import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT } from "./ports.ts";

// Deliberately not this app's dev port: a leftover dev server answering here
// would be reused by `reuseExistingServer` below and serve these specs a stale
// module graph. Both of this app's ports live in `ports.env` — see ./ports.ts,
// which is also the file `turbo/generators/config.ts` rewrites when it clones
// the app, so no number in this file has to move with it.
export const BASE_URL = `http://localhost:${E2E_PORT}`;

// Docs: https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./e2e",
  // The `.e2e.ts` suffix keeps these clear of Vitest, which owns `.test.tsx`
  // under `test/`. Playwright's default glob would not match it.
  testMatch: "**/*.e2e.ts",
  // Playwright drives a real browser, so a bare `expect` waits far longer than
  // a jsdom assertion would.
  expect: { timeout: 5_000 },
  fullyParallel: true,
  // A committed `.only` passes locally and silently skips the rest in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { open: "never" }],
        // Uploaded as a CI artifact alongside the HTML report. Without it a
        // failing test exists only in the job log, which nobody opens on a
        // green-looking run — and this job is `continue-on-error`, so it always
        // looks green.
        ["junit", { outputFile: "junit.xml" }],
      ]
    : "list",
  use: {
    baseURL: BASE_URL,
    // Pinned for the same reason vitest.setup.ts pins it: i18next detects the
    // browser's navigator.language, and Chromium defaults to en-US — so without
    // this, assertions on user-visible text would resolve to English here and
    // Vietnamese in a component test.
    locale: "vi-VN",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // What CI and a plain `e2e` run use: a fresh context per test.
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The twin `e2e:headed` runs, and the only reason it exists: `reuseContext`
    // keeps one window open for the whole run instead of one per test. It is
    // experimental and its reset between tests is best-effort, so it never
    // touches CI — always name the project rather than relying on the default,
    // since a bare `playwright test` would otherwise run both.
    {
      name: "watch",
      // `timeout: 0` for exactly the reason `--debug` bundles `--timeout=0`:
      // `slowMo` sleeps *inside* each dispatched call, so it spends the same
      // wall clock the per-test timeout measures. A paced run would otherwise
      // race a clock it is deliberately slower than.
      timeout: 0,
      use: {
        ...devices["Desktop Chrome"],
        reuseContext: true,
        launchOptions: { slowMo: 500 },
      },
    },
  ],
  // Serves the production build so E2E exercises what actually ships, including
  // the PUBLIC_* config `~/env.ts` reads off `import.meta.env` — baked in at
  // build time (`bun run build`), not injected at boot.
  webServer: {
    // No `--port`/`--strictPort` flags: `vite.config.ts` gives the preview
    // server both, off the same `ports.env` this file reads, so the two cannot
    // describe different ports. `preview.strictPort` is what makes it fail
    // loudly instead of drifting to another port and leaving Playwright to wait
    // out its 180s timeout on a port nothing is listening to.
    //
    // Neither that nor `reuseExistingServer` guards against a server already
    // answering on the E2E port: Playwright probes `url` before it ever runs
    // `command`, so anything there is reused locally (and rejected outright in
    // CI) and this line never executes. Kill whatever holds it yourself before
    // an e2e run — a stale server serves stale modules to every spec and the
    // run still looks green.
    command: "bun run build && bun run preview",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // `stdout` defaults to "ignore", so a build that fails in here surfaces as an
    // unexplained timeout instead of the compiler error that caused it.
    stdout: "pipe",
    // A cold build + preview on a shared runner is slower than on a dev box.
    timeout: 180_000,
  },
});
