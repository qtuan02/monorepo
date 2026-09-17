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
    await expect(page.getByText("30 hoá đơn được tìm thấy")).toBeVisible();

    await page.getByRole("combobox", { name: "Toà nhà" }).click();
    await page.getByRole("option", { name: "Căn hộ Dịch Vụ Cao Cấp" }).click();
    await expect(page.getByText("10 hoá đơn được tìm thấy")).toBeVisible();

    await page.getByRole("link", { name: "Chỉ số điện nước" }).click();
    // Only Phòng 201/202 sit in b2 — three readings.
    await expect(page.getByText("3 chỉ số được tìm thấy")).toBeVisible();
  });

  test("opens the VietQR dialog from a Hoá đơn detail", async ({ page }) => {
    await page.goto(ROUTES.invoiceDetailPath("I003"));
    await page.getByRole("button", { name: "Thanh toán VietQR" }).click();

    const dialog = page.getByRole("dialog", { name: "Mã thanh toán VietQR" });
    await expect(dialog).toContainText("Thanh toan HÓA-003");
    await expect(dialog).toContainText("3.400.000");
  });

  test("derives consumption and status while a reading is typed", async ({
    page,
  }) => {
    await page.goto(ROUTES.METER_INPUT);
    const row = page.getByRole("row", { name: /^102\b/ });
    await expect(row.getByText("Chưa nhập")).toBeVisible();

    await row.getByLabel("Chỉ số điện mới phòng 102").fill("3450");
    await expect(row.getByText("50", { exact: true })).toBeVisible();
    await expect(row.getByText("Nháp")).toBeVisible();

    await row.getByLabel("Chỉ số nước mới phòng 102").fill("880");
    await expect(row.getByText("Bất thường")).toBeVisible();
  });
});
