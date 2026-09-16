import type { Page } from "@playwright/test";

const AUTH_TOKEN = "e2e-token";

// The exact entry `useAuthStore`'s `persist` middleware writes (see
// ~/stores/use-auth-store.ts), so the app boots already signed in.
const AUTH_STORAGE_KEY = "auth";
const AUTH_STORAGE_VALUE = JSON.stringify({
  state: { token: AUTH_TOKEN },
  version: 0,
});

/**
 * Seeds an authenticated session, the storage-state way but applied per page —
 * still no clicking through the sign-in form.
 *
 * `test.use({ storageState })` is the more familiar spelling and does the same
 * job, but it is a *context* option: changing it mid-run forces Playwright to
 * build a fresh browser context, which defeats the `watch` project's
 * `reuseContext` and puts the signed-in specs in a second window. An init
 * script rides on the page instead, so every spec shares one context.
 *
 * Call it before the first `page.goto` — init scripts run before any page
 * script, which is what makes the token visible to the store on boot.
 */
export async function signIn(page: Page) {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [AUTH_STORAGE_KEY, AUTH_STORAGE_VALUE] as const,
  );
}
