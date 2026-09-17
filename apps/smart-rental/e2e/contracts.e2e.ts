import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// What only a real browser proves for #162: the wizard's horizontal stepper
// collapsing to "Bước n/m · tên" at 390 px (spec #153 §10 row 15), and the
// detail screen's breadcrumb + real Tabs actually rendering on the bundle.
test.describe("Hợp đồng", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("wizard: the horizontal stepper collapses to one line at 390 px", async ({
    page,
  }) => {
    await page.goto(ROUTES.CONTRACT_CREATE);
    await expect(
      page.getByRole("heading", { name: "Tạo hợp đồng mới" }),
    ).toBeVisible();

    // Desktop: every step's pill is visible at once. Scoped to `main` and
    // `exact` — "Người thuê"/"Chọn phòng" etc. also name a sidebar link, a
    // bottom-nav link and the search palette's own copy, which Playwright's
    // strict mode otherwise treats as extra matches for the same text.
    const main = page.getByRole("main");
    await expect(main.getByText("Chọn phòng", { exact: true })).toBeVisible();
    await expect(main.getByText("Người thuê", { exact: true })).toBeVisible();
    await expect(main.getByText("Điều khoản", { exact: true })).toBeVisible();
    await expect(main.getByText("Xác nhận", { exact: true })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText("Bước 1/4 · Chọn phòng")).toBeVisible();

    // Step 1: only "available" Phòng of the Building scope are offered.
    await page.getByPlaceholder("Tìm phòng trống…").click();
    await expect(page.getByRole("option", { name: /Phòng 101/ })).toBeVisible();
    await expect(
      page.getByRole("option", { name: /Phòng 102/ }),
    ).not.toBeVisible();
  });

  test("detail: breadcrumb + tabs render for an existing Hợp đồng", async ({
    page,
  }) => {
    await page.goto(ROUTES.contractDetailPath("C002"));
    await expect(
      page.getByRole("heading", { name: "Chi tiết hợp đồng" }),
    ).toBeVisible();
    await expect(page.getByText("HĐ-002")).toBeVisible();

    await expect(page.getByRole("tab", { name: /^Hoá đơn/ })).toBeVisible();
    await page.getByRole("tab", { name: "Chỉ số" }).click();
    await page.getByRole("tab", { name: "Lịch sử" }).click();
    await expect(page.getByText("Chưa có lịch sử")).toBeVisible();
  });
});
