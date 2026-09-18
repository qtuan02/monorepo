import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Việc cần làm và Thông báo: the URL-persisted facet filter and the flat
// (no nested tab) layout, both real-layout concerns a component test can't
// prove on its own.
test.describe("Việc cần làm và Thông báo", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("Việc cần làm: the same queue as Hôm nay, filterable by loại on the URL", async ({
    page,
  }) => {
    await page.goto(ROUTES.TASKS);
    await expect(
      page.getByRole("heading", { name: "Việc cần làm" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Gửi nhắc" }).first(),
    ).toBeVisible();
    // No create form on a read-only screen.
    await expect(page.getByRole("button", { name: "Thêm việc" })).toHaveCount(
      0,
    );

    await page.getByRole("button", { name: "Loại việc" }).click();
    await page.getByRole("checkbox", { name: "Hoá đơn quá hạn" }).click();
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/type=invoice_overdue/);
    await expect(
      page.getByText("Hợp đồng sắp hết hạn", { exact: true }),
    ).toHaveCount(0);
  });

  test("Thông báo: one flat tab list, «Dùng mẫu» on every mẫu, no «Gửi ngay»", async ({
    page,
  }) => {
    await page.goto(ROUTES.COMMUNICATIONS);
    // `exact` — the "Mẫu thông báo" card heading below it also matches
    // "Thông báo" as a substring.
    await expect(
      page.getByRole("heading", { name: "Thông báo", exact: true }),
    ).toBeVisible();

    // No nested tabs — a channel filter, not a second Tabs list.
    await expect(page.getByRole("tab")).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Gửi ngay" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Dùng mẫu" }).first(),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Nhật ký gửi tin" }).click();
    await expect(page.getByText("Tổng tin nhắn")).toBeVisible();
  });
});
