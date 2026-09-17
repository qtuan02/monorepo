import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// The real bundle proving what a component test cannot: the FormSheet flow
// end to end (validation → toast), and the tenant's own derived badge.
test.describe("Người thuê và Khai báo lưu trú", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("adds a Người thuê through the FormSheet, with an error summary first", async ({
    page,
  }) => {
    await page.goto(ROUTES.TENANTS);
    await expect(
      page.getByRole("heading", { name: "Quản lý Người thuê" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Thêm Người thuê" }).click();
    await page.getByRole("button", { name: "Lưu lại" }).click();
    await expect(page.getByText(/Vui lòng kiểm tra lại \d+ lỗi/)).toBeVisible();

    await page.getByLabel("Họ và tên").fill("Người Thuê E2E");
    await page.getByLabel("Số CCCD").fill("012345678999");
    await page.getByRole("button", { name: "Ngày sinh" }).click();
    await page.getByRole("button", { name: "15", exact: true }).click();
    await page.getByLabel("Quê quán").fill("Đà Nẵng");
    await page.getByLabel("Số điện thoại").fill("0905999999");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByRole("button", { name: "Lưu lại" }).click();

    await expect(
      page.getByText("Đã thêm Người thuê Người Thuê E2E"),
    ).toBeVisible();
    await expect(
      page.getByText("Người Thuê E2E", { exact: true }),
    ).toBeVisible();
  });

  test("marks Thông báo lưu trú Đã gửi from Khai báo lưu trú", async ({
    page,
  }) => {
    await page.goto(ROUTES.COMPLIANCE);
    await expect(
      page.getByRole("heading", { name: "Khai báo lưu trú" }),
    ).toBeVisible();

    // T005 (Hoàng Văn E) ships with no Thông báo lưu trú record yet.
    const row = page
      .locator('[data-slot="residence-declaration-row"]')
      .filter({ hasText: "Hoàng Văn E" });
    await expect(row.getByRole("button", { name: "Đã gửi" })).toBeVisible();

    await row.getByRole("button", { name: "Đã gửi" }).click();
    await expect(
      page.getByText("Đã đánh dấu gửi Thông báo lưu trú cho Hoàng Văn E"),
    ).toBeVisible();
    await expect(row.getByRole("button", { name: "Đã gửi" })).toHaveCount(0);
  });
});
