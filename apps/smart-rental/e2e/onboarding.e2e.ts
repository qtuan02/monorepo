import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Onboarding sits outside both guards — a fresh account lands here straight
// from registering — but the last step navigates into the shell, which is
// guarded, so the session is seeded to see it arrive.
test.describe("onboarding", () => {
  test("walks the wizard and lands on the dashboard", async ({ page }) => {
    await signIn(page);
    await page.goto(ROUTES.ONBOARDING);
    await expect(
      page.getByRole("heading", { name: "Chào mừng!" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await expect(page.getByText("Tên khu trọ tối thiểu 2 ký tự")).toBeVisible();

    await page.getByLabel("Tên khu trọ").fill("Trọ Sinh Viên");
    await page.getByLabel("Địa chỉ").fill("123 Ngũ Hành Sơn, Đà Nẵng");
    await page.getByRole("button", { name: "Tiếp tục" }).click();

    await page.getByLabel("Giá thuê mặc định").fill("3000000");
    await page.getByRole("button", { name: "Tiếp tục" }).click();

    await page.getByRole("button", { name: "Hoàn thành" }).click();

    await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));
    await expect(
      page.getByRole("heading", { name: "Tổng quan" }),
    ).toBeVisible();
  });
});
