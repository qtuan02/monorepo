import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { mockHealthCheck, mockSessionRefresh } from "./support/auth-session";

/**
 * The guard flow is exactly what a jsdom test cannot prove: real navigation
 * across routes and a real boot sequence in the built bundle, with the
 * backend's two calls (`/health-check`, `/auth/refresh`) stubbed at the
 * network so no `chat-socket` instance has to be running.
 */
test.describe("Health gate", () => {
  test("blocks the UI until the backend answers healthy", async ({ page }) => {
    let resolveHealth: (() => void) | undefined;
    await page.route("**/api/health-check", async (route) => {
      await new Promise<void>((resolve) => {
        resolveHealth = resolve;
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: true, message: null, status: 200 }),
      });
    });
    await mockSessionRefresh(page, null);

    const navigation = page.goto(ROUTES.SIGN_IN);
    // The boot Island (CONTEXT.md, ADR-0016) — one `role="status"` shared
    // with the session check, only its text changing between the two.
    await expect(page.getByRole("status")).toHaveText(
      "Connecting to server...",
    );

    resolveHealth?.();
    await navigation;

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });
});

test.describe("session guard — signed out", () => {
  test("bounces / to sign-in with the form when the refresh fails (401)", async ({
    page,
  }) => {
    await mockHealthCheck(page);
    await mockSessionRefresh(page, null);

    await page.goto(ROUTES.HOME);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.SIGN_IN}$`));
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("shows an unknown path's 404 inside the shell, with no session required", async ({
    page,
  }) => {
    await mockHealthCheck(page);
    await mockSessionRefresh(page, null);

    await page.goto("/some-unknown-path");

    await expect(
      page.getByRole("heading", { name: "404 Not Found" }),
    ).toBeVisible();
  });

  test("boots without an uncaught exception", async ({ page }) => {
    await mockHealthCheck(page);
    await mockSessionRefresh(page, null);

    // A mocked 401 always makes Chrome itself log a "Failed to load
    // resource" console entry — that is the browser's network stack, not
    // application code, so a real regression is an uncaught exception
    // (`pageerror`), never a console message.
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(ROUTES.HOME);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe("session guard — signed in", () => {
  test("a still-good refresh cookie lets / through to the shell (200)", async ({
    page,
  }) => {
    await mockHealthCheck(page);
    await mockSessionRefresh(page, "e2e-token");

    await page.goto(ROUTES.HOME);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(page.getByRole("heading", { name: "Chats" })).toBeVisible();
  });

  test("bounces sign-in to / once a session already exists", async ({
    page,
  }) => {
    await mockHealthCheck(page);
    await mockSessionRefresh(page, "e2e-token");

    await page.goto(ROUTES.SIGN_IN);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(page.getByRole("heading", { name: "Chats" })).toBeVisible();
  });
});
