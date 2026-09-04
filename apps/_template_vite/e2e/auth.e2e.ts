import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

/**
 * The guard flow is exactly what a jsdom test cannot prove: it needs real
 * navigation across routes in the built bundle. Every route inside the shell
 * — the launcher included — sits behind ProtectedRoute (see
 * .agents/rules/routing-route-guards.md), so signing OUT is enough to prove
 * the redirect; no auth backend is needed.
 */
test.describe("auth guard — signed out", () => {
  test("redirects a protected route to sign-in", async ({ page }) => {
    await page.goto(ROUTES.PATIENTS);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.SIGN_IN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("redirects the launcher to sign-in", async ({ page }) => {
    await page.goto(ROUTES.HOME);

    await expect(page).toHaveURL(new RegExp(`${ROUTES.SIGN_IN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("shows both fields on the sign-in form", async ({ page }) => {
    await page.goto(ROUTES.SIGN_IN);

    await expect(page.getByLabel("Tài khoản", { exact: true })).toBeVisible();
    // `exact` matters here: getByLabel matches substrings, and the reveal
    // button's own label ("Hiện mật khẩu") would otherwise match too.
    await expect(page.getByLabel("Mật khẩu", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });

  // The one spec that exercises the form rather than the guard: it proves the
  // Zod schema reaches the built bundle and renders its message, which a jsdom
  // test cannot claim about the shipped artifact.
  test("rejects a password shorter than six characters", async ({ page }) => {
    await page.goto(ROUTES.SIGN_IN);

    await page.getByLabel("Tài khoản", { exact: true }).fill("bacsi");
    await page.getByLabel("Mật khẩu", { exact: true }).fill("123");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(
      page.getByText("Mật khẩu phải có ít nhất 6 ký tự."),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.SIGN_IN}$`));
  });
});

test.describe("auth guard — signed in", () => {
  test("opens a launcher card straight to its route", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);
    await page.getByRole("link", { name: /Bảng điều khiển/ }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.DASHBOARD}$`));
  });
});
