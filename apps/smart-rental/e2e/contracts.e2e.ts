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

  test("wizard: 2 bước, the horizontal stepper collapses to one line at 390 px", async ({
    page,
  }) => {
    await page.goto(ROUTES.CONTRACT_CREATE);
    await expect(
      page.getByRole("heading", { name: "Tạo hợp đồng mới" }),
    ).toBeVisible();

    // Desktop: both step pills are visible at once (spec #179 §3.4 — 2 bước
    // thay 4). Scoped to `main` and `exact` — the sidebar/bottom-nav/search
    // palette also carry "Người thuê", which strict mode would otherwise
    // treat as an extra match for the same text.
    const main = page.getByRole("main");
    await expect(
      main.getByText("Phòng & Người thuê", { exact: true }),
    ).toBeVisible();
    await expect(
      main.getByText("Điều khoản & xác nhận", { exact: true }),
    ).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText("Bước 1/2 · Phòng & Người thuê")).toBeVisible();

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
