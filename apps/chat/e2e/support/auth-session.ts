import type { Page } from "@playwright/test";

const HEALTH_CHECK_PATH = "**/api/health-check";
const REFRESH_PATH = "**/api/v1/auth/refresh";

/** The Health gate blocks every route until this resolves — every spec needs it. */
export async function mockHealthCheck(page: Page) {
  await page.route(HEALTH_CHECK_PATH, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: true, message: null, status: 200 }),
    }),
  );
}

/**
 * Stubs the boot-time `/auth/refresh` call the session guard awaits before it
 * decides. `token: null` simulates a visitor with no refresh cookie (or an
 * expired one); a string simulates a still-good one — no clicking through the
 * sign-in form and no `localStorage` seeding, since Session here is an
 * in-memory access token with no persisted key to write (see CONTEXT.md —
 * Session).
 */
export async function mockSessionRefresh(page: Page, token: string | null) {
  await page.route(REFRESH_PATH, (route) =>
    route.fulfill({
      status: token ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify({
        data: token ? { accessToken: token } : null,
        message: token ? null : "Unauthorized",
        status: token ? 200 : 401,
      }),
    }),
  );
}
