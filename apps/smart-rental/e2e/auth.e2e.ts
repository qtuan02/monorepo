import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { formatFullDate } from "../src/utils/date";
import { signIn } from "./support/auth-session";

// "Hôm nay"'s own <h1> is today's date (ADR-0011, spec #153 §10) — computed
// the same way the app computes it, so this never drifts from a hardcoded date.
const homeHeading = formatFullDate();

/**
 * The guard flow is exactly what a jsdom test cannot prove: it needs real
 * navigation across routes in the built bundle. Every route inside the shell —
 * the dashboard included — sits behind ProtectedRoute (see
 * .agents/rules/routing-route-guards.md), so signing OUT is enough to prove
 * the redirect; no auth backend is needed.
 */
test.describe("auth guard — signed out", () => {
  test("redirects a protected route to sign-in", async ({ page }) => {
    await page.goto(ROUTES.BUILDINGS);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("redirects the dashboard to sign-in", async ({ page }) => {
    await page.goto(ROUTES.HOME);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("shows both fields on the sign-in form", async ({ page }) => {
    await page.goto(ROUTES.AUTH_LOGIN);

    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Mật khẩu", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });

  // The one spec that exercises the form rather than the guard: it proves the
  // Zod schema reaches the built bundle and renders its message, which a jsdom
  // test cannot claim about the shipped artifact.
  test("rejects a password shorter than six characters", async ({ page }) => {
    await page.goto(ROUTES.AUTH_LOGIN);

    await page.getByLabel("Mật khẩu", { exact: true }).fill("123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(
      page.getByText("Mật khẩu phải có ít nhất 6 ký tự"),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
  });

  test("signs in with the prefilled demo credentials and lands on the dashboard", async ({
    page,
  }) => {
    await page.goto(ROUTES.AUTH_LOGIN);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(
      page.getByRole("heading", { name: homeHeading }),
    ).toBeVisible();
  });
});

test.describe("auth guard — signed in", () => {
  test("bounces the sign-in screen to the dashboard", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.AUTH_LOGIN);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(
      page.getByRole("heading", { name: homeHeading }),
    ).toBeVisible();
  });
});
