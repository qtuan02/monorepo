import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT } from "./ports.ts";

// Deliberately not this app's dev port: a leftover dev server answering here
// would be reused by `reuseExistingServer` below and serve these specs a stale
// module graph — and in this Runtime it would also be a *client-rendered* dev
// server answering assertions about what the production server sends. Both of
// this app's ports live in `ports.env` — see ./ports.ts.
export const BASE_URL = `http://localhost:${E2E_PORT}`;

// Docs: https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./e2e",
  // The `.e2e.ts` suffix keeps these clear of Vitest, which owns `.test.tsx`
  // under `test/`. Playwright's default glob would not match it.
  testMatch: "**/*.e2e.ts",
  expect: { timeout: 5_000 },
  fullyParallel: true,
  // A committed `.only` passes locally and silently skips the rest in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    // Chromium defaults to en-US. Pinned so a browser-driven assertion on
    // user-visible text reads the same here as in a component test. The
    // raw-document specs send `Accept-Language` themselves, because the
    // `request` fixture does not inherit this.
    locale: "vi-VN",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // What CI and a plain `e2e` run use: a fresh context per test.
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The twin `e2e:headed` runs, and the only reason it exists: `reuseContext`
    // keeps one window open for the whole run. It is experimental and its reset
    // between tests is best-effort, so it never touches CI — always name the
    // project, since a bare `playwright test` would run both.
    {
      name: "watch",
      // `slowMo` sleeps inside each dispatched call, so it spends the same wall
      // clock the per-test timeout measures. A paced run would otherwise race a
      // clock it is deliberately slower than.
      timeout: 0,
      use: {
        ...devices["Desktop Chrome"],
        reuseContext: true,
        launchOptions: { slowMo: 500 },
      },
    },
  ],
  // A real production server, not `react-router dev`: these specs assert on what
  // the server sends before any JavaScript runs, which only the built output
  // proves. It goes through the app's own `start` script rather than spelling
  // `react-router-serve` out again, so the two can never run different binaries
  // — and that script carries the `dotenv -e ../../.env` prefix the server needs
  // to read `TEMPLATE_REACTROUTER_SESSION_SECRET`.
  webServer: {
    command: "bun run build && bun run start",
    // `react-router-serve` takes its port from `PORT` and nothing else — there
    // is no flag and no config file. With `PORT` unset it picks the first free
    // port instead of failing, so this line is what keeps the E2E server off
    // the dev port. Playwright merges this object over the child's environment
    // and dotenv-cli never overrides an already-set variable, so it wins over
    // the `PORT=3005` the `start` script loads from `ports.env`.
    env: { PORT: String(E2E_PORT) },
    url: BASE_URL,
    // Reuse is safe because the E2E port is not the dev port — but if a run
    // behaves impossibly, kill whatever already holds it before believing it.
    reuseExistingServer: !process.env.CI,
    // `stdout` defaults to "ignore", so a failing build would surface as an
    // unexplained timeout instead of the compiler error that caused it.
    stdout: "pipe",
    timeout: 180_000,
  },
});
