import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Báo cáo và Cài đặt: what a real layout proves that a component test
// cannot — the chart canvases actually paint, and the shell's Building scope
// genuinely swaps the whole screen (spec #153 §10 row 29).
test.describe("Báo cáo và Cài đặt", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("Báo cáo: null scope shows the comparison table, one Toà nhà shows charts + kỳ table", async ({
    page,
  }) => {
    await page.goto(ROUTES.REPORTS);
    await expect(page.getByRole("heading", { name: "Báo cáo" })).toBeVisible();

    // Default scope is "Tất cả Toà nhà" — the comparison table, one row per
    // Toà nhà, no chart.
    await expect(
      page.getByRole("cell", { name: "Trọ Sinh Viên Xanh" }),
    ).toBeVisible();
    await expect(page.getByText("Doanh thu theo tháng")).toHaveCount(0);

    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();
    await expect(page.getByText("Doanh thu theo tháng")).toBeVisible();
    await expect(page.getByText("Lấp đầy theo tầng")).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Tháng" }),
    ).toBeVisible();

    // Round 4 §10 Q16: the donut is gone (the KPI strip above already prints
    // the same "Lấp đầy phòng" percentage), and "Xuất báo cáo" moved onto the
    // title row instead of a row of its own.
    await expect(page.getByText("Tỷ lệ lấp đầy")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Xuất báo cáo" }),
    ).toBeVisible();
  });

  test("Cài đặt: hồ sơ chủ nhà, không còn cấu hình điện bậc thang", async ({
    page,
  }) => {
    await page.goto(ROUTES.SETTINGS);

    await expect(page.getByRole("heading", { name: "Cài đặt" })).toBeVisible();
    // `exact` — the page description also reads "Hồ sơ chủ nhà và các Toà
    // nhà đang quản lý.", which contains this card's title as a substring.
    await expect(
      page.getByText("Hồ sơ chủ nhà", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Cấu hình điện bậc thang")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Khôi phục dữ liệu mẫu" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Cài đặt Trọ Sinh Viên Xanh" }),
    ).toBeVisible();
  });
});
