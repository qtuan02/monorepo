import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// The Portal shell around every guarded screen: what only a real browser can
// prove — a choice surviving a real reload, the sidebar sheet on a phone-wide
// viewport, and sign-out landing on the sign-in screen.
test.describe("shell", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.HOME);
  });

  test("keeps the Building scope across a reload, and `null` is every Toà nhà", async ({
    page,
  }) => {
    const selector = page.getByRole("combobox", { name: "Tòa nhà" });
    await expect(selector).toContainText("Tất cả tòa nhà");

    await selector.click();
    await page.getByRole("option", { name: "Trọ Sinh Viên Xanh" }).click();
    await expect(selector).toContainText("Trọ Sinh Viên Xanh");

    await page.reload();
    await expect(selector).toContainText("Trọ Sinh Viên Xanh");

    await selector.click();
    await page.getByRole("option", { name: "Tất cả tòa nhà" }).click();
    await page.reload();
    await expect(selector).toContainText("Tất cả tòa nhà");
  });

  test("navigates through the sidebar and marks the open area", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Hợp đồng" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.CONTRACTS}$`));
    await expect(
      page.getByRole("heading", { name: "Quản lý hợp đồng" }),
    ).toBeVisible();
    // `exact`: the list screen itself carries a "Thêm hợp đồng" link (#137),
    // which the substring match would also resolve.
    await expect(
      page.getByRole("link", { name: "Hợp đồng", exact: true }),
    ).toHaveAttribute("data-active");
  });

  test("opens the sidebar as a sheet on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page.getByRole("link", { name: "Hợp đồng" })).toBeHidden();
    await page.getByRole("button", { name: "Toggle Sidebar" }).click();
    await expect(page.getByRole("link", { name: "Hợp đồng" })).toBeVisible();
  });

  test("signs out from the nav-user menu", async ({ page }) => {
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.AUTH_LOGIN}$`));
    await expect(
      page.getByRole("heading", { name: "Đăng nhập" }),
    ).toBeVisible();
  });
});
