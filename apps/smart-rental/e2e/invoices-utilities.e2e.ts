import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Hoá đơn and Chỉ số điện nước on the real bundle: the Building scope
// narrowing both lists, the VietQR dialog, and the meter-input badge moving
// as a reading is typed.
test.describe("Hoá đơn và Chỉ số điện nước", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("scopes both lists to the selected Toà nhà", async ({ page }) => {
    await page.goto(ROUTES.INVOICES);
    // 6 kỳ Hoá đơn (04–09/2026) × 14 hợp đồng — spec #153 §10 row 33.
    await expect(page.getByText("84 hoá đơn được tìm thấy")).toBeVisible();

    await page.getByRole("combobox", { name: "Toà nhà" }).click();
    await page.getByRole("option", { name: "Căn hộ Dịch Vụ Cao Cấp" }).click();
    await expect(page.getByText("36 hoá đơn được tìm thấy")).toBeVisible();

    await page.getByRole("link", { name: "Chỉ số điện nước" }).click();
    await expect(page.getByText("24 chỉ số được tìm thấy")).toBeVisible();
  });

  // Ticket #157 — the list-screen foundation, proven on Hoá đơn: the KPI
  // strip, row selection → the sticky action bar, and — at 390 px, where the
  // table gives way to an Item list — no horizontal overflow.
  test("shows the KPI strip and the selection bar on desktop; an Item list at 390 px", async ({
    page,
  }) => {
    await page.goto(ROUTES.INVOICES);

    const kpiStrip = page.locator('[data-slot="kpi-strip"]');
    await expect(kpiStrip.getByText("Đã thu", { exact: true })).toBeVisible();
    await expect(kpiStrip.getByText("Chưa thu", { exact: true })).toBeVisible();
    await expect(
      kpiStrip.getByText("Thu một phần", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Dạng bảng" }).click();
    const rows = page.getByRole("row");
    await rows.nth(1).getByRole("checkbox", { name: "Chọn dòng" }).click();
    await rows.nth(2).getByRole("checkbox", { name: "Chọn dòng" }).click();

    await expect(page.getByText("Đã chọn 2", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Gửi nhắc" }).click();
    await expect(page.getByText("Đã chọn 2", { exact: true })).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("table")).toBeHidden();
    await expect(
      page.locator('[data-slot="data-table-mobile-row"]').first(),
    ).toBeVisible();
    // The content column's own scrollWidth, not documentElement's — a
    // horizontal overflow inside the card is exactly what C.1 #10/#12 found.
    const contentWidth = await page.evaluate(() => {
      const content = document.querySelector("main");
      return content ? content.scrollWidth - content.clientWidth : 0;
    });
    expect(contentWidth).toBeLessThanOrEqual(1);
  });

  test("opens the VietQR dialog from a Hoá đơn detail", async ({ page }) => {
    // I071 = C001's kỳ 09, OVERDUE — nothing paid, so "còn phải trả" is the
    // full total (spec #153 §10 row 12).
    await page.goto(ROUTES.invoiceDetailPath("I071"));
    await page.getByRole("button", { name: "Thanh toán VietQR" }).click();

    const dialog = page.getByRole("dialog", { name: "Mã thanh toán VietQR" });
    await expect(dialog).toContainText("HOA-071 Phong 102");
    await expect(dialog).toContainText("3.240.000");
  });

  test("derives consumption and status while a reading is typed", async ({
    page,
  }) => {
    await page.goto(ROUTES.METER_INPUT);
    // Cells join with no separator ("Phòng 1021000—1000—…"), so a `\b`-based
    // regex can't tell "102" from the start of "1000" — a plain substring
    // match still lands on the one row that starts with it.
    const row = page.getByRole("row", { name: "Phòng 102" });
    await expect(row.getByText("Chưa nhập")).toBeVisible();

    await row.getByLabel("Chỉ số điện mới phòng Phòng 102").fill("3450");
    await expect(row.getByText("2450", { exact: true })).toBeVisible();
    await expect(row.getByText("Nháp")).toBeVisible();

    await row.getByLabel("Chỉ số nước mới phòng Phòng 102").fill("880");
    await expect(row.getByText("Bất thường")).toBeVisible();
  });
});
