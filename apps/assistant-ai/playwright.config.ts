import { defineConfig, devices } from "@playwright/test";

import { E2E_PORT } from "./ports.ts";

// Deliberately not this app's dev port: a leftover dev server answering here
// would make these specs assert against whatever module graph that process
// still holds. Both of this app's ports live in `ports.env` — see ./ports.ts.
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
    // Pinned for the same reason `test/support/render.tsx` pins one: Chromium
    // defaults to en-US, and next-intl negotiates a locale from Accept-Language.
    // The raw-HTML specs additionally send the header themselves, because the
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
  // A real production server, not `next dev`: these specs assert on what the
  // server sends before any JavaScript runs, which only the built output
  // proves. It goes through the app's own `start` script rather than spelling
  // `next start` out again, so the two can never run different binaries — and
  // so the standalone switch in ticket 13 §2 is one edit, not two. That script
  // carries the `dotenv -e ../../.env` prefix `next start` needs, because it
  // reads a `.env` from the app directory only and this repo keeps one at the
  // root.
  webServer: {
    command: "bun run build && bun run start",
    // `next start` takes its port from `--port` or `PORT`, and `start` supplies
    // the *dev* port through `ports.env`. Playwright merges this object over
    // the child's environment, and dotenv-cli never overrides a variable that
    // is already set — so this wins and the E2E server lands on the E2E port.
    // It is also the one spelling that works on cmd.exe and a POSIX shell
    // alike, which a `PORT=… ` prefix or a `$(…)` substitution would not.
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
