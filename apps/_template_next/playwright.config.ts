import { defineConfig, devices } from "@playwright/test";

// Deliberately not the dev port (3001) and not the Vite template's (3000): a
// leftover dev server answering on the same port would make these specs assert
// against whatever module graph that process still holds.
const PORT = 3101;
export const BASE_URL = `http://localhost:${PORT}`;

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
  // server sends before any JavaScript runs, which only the built output proves.
  // `dotenv` is spelled out because `next start` reads a `.env` from the app
  // directory only, and this repo keeps one at the root.
  webServer: {
    command: `bun run build && dotenv -e ../../.env -- next start --port ${PORT}`,
    url: BASE_URL,
    // Reuse is safe here because the port is dedicated to E2E — but if a run
    // behaves impossibly, kill whatever already holds 3101 before believing it.
    reuseExistingServer: !process.env.CI,
    // `stdout` defaults to "ignore", so a failing build would surface as an
    // unexplained timeout instead of the compiler error that caused it.
    stdout: "pipe",
    timeout: 180_000,
  },
});
