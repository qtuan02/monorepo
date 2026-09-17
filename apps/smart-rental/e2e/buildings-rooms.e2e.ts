import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// The first two business screens on the real bundle: what only a browser can
// prove — a list filter surviving a real reload through the URL, and the
// create flow ending in a toast.
test.describe("Toà nhà và Phòng", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("keeps the Phòng search, facet and page on the URL across a reload", async ({
    page,
  }) => {
    await page.goto(ROUTES.ROOMS);
    await expect(
      page.getByRole("heading", { name: "Danh sách phòng" }),
    ).toBeVisible();
    await expect(page.getByText("45 phòng được tìm thấy")).toBeVisible();

    await page.getByRole("button", { name: "Trạng thái" }).click();
    await page.getByRole("checkbox", { name: /Trống/ }).click();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/status=available/);

    await page.getByRole("searchbox").fill("Phòng 3");
    await expect(page).toHaveURL(/q=Ph/);
    // Phòng 301, 304, …, 319 are "available" → 7 of the 20 in b3.
    await expect(page.getByText("7 phòng được tìm thấy")).toBeVisible();

    await page.reload();
    await expect(page.getByText("7 phòng được tìm thấy")).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveValue("Phòng 3");

    await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.ROOMS}$`));
    await page.getByRole("button", { name: "Trang sau" }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.reload();
    await expect(page.getByText("13–24")).toBeVisible();
  });

  test("switches the Phòng list to the table and sorts a column", async ({
    page,
  }) => {
    await page.goto(ROUTES.ROOMS);
    await page.getByRole("tab", { name: "Dạng bảng" }).click();
    await expect(page).toHaveURL(/view=table/);
    await expect(page.getByRole("table")).toBeVisible();

    // A numeric column sorts descending first (TanStack's `sortDescFirst`).
    await page.getByRole("button", { name: "Giá thuê" }).click();
    await expect(page.getByRole("row").nth(1)).toContainText("6.000.000");
    await page.getByRole("button", { name: "Giá thuê" }).click();
    await expect(page.getByRole("row").nth(1)).toContainText("2.500.000");
  });

  test("creates a Toà nhà through the FormSheet and toasts", async ({
    page,
  }) => {
    await page.goto(ROUTES.BUILDINGS);
    await expect(page.getByText("Trọ Sinh Viên Xanh")).toBeVisible();

    await page.getByRole("button", { name: "Thêm toà nhà" }).click();
    await page.getByRole("button", { name: "Lưu lại" }).click();
    await expect(
      page.getByText("Tên toà nhà phải có ít nhất 2 ký tự"),
    ).toBeVisible();

    await page.getByLabel("Tên toà nhà").fill("Trọ E2E");
    await page.getByLabel("Địa chỉ").fill("1 Đường Kiểm Thử, Đà Nẵng");
    await page.getByRole("button", { name: "Lưu lại" }).click();

    await expect(page.getByText("Đã thêm toà nhà Trọ E2E")).toBeVisible();
    await expect(page.getByText("Trọ E2E", { exact: true })).toBeVisible();
  });

  test("edits a Toà nhà's Cài đặt through the Sheet and sees it change in place", async ({
    page,
  }) => {
    await page.goto(ROUTES.buildingDetailPath("b1"));
    await expect(
      page.getByRole("heading", { name: "Trọ Sinh Viên Xanh" }),
    ).toBeVisible();

    const settingsTab = page.getByRole("tabpanel", { name: "Cài đặt" });
    await page.getByRole("tab", { name: "Cài đặt" }).click();
    await expect(settingsTab.getByText("3.500")).toBeVisible();

    await page.getByRole("button", { name: "Cài đặt" }).click();
    const sheet = page.getByRole("dialog", { name: "Cài đặt toà nhà" });
    await sheet.getByLabel("Giá điện / kWh").fill("4200");
    await expect(
      sheet.getByText("Vượt trần giá điện cho người thuê"),
    ).toBeVisible();

    await sheet.getByRole("button", { name: "Lưu lại" }).click();
    await expect(
      page.getByText("Đã cập nhật cài đặt Trọ Sinh Viên Xanh"),
    ).toBeVisible();

    // Still saved despite the cap warning — the tab now reads the new price.
    await expect(settingsTab.getByText("4.200")).toBeVisible();
    await expect(
      settingsTab.getByText("Vượt trần giá điện cho người thuê"),
    ).toBeVisible();
  });

  test("opens a Phòng from its card and finds its Toà nhà scope applied", async ({
    page,
  }) => {
    await page.goto(ROUTES.roomDetailPath("R-B2-201"));
    await expect(page.getByText("Phòng 201").first()).toBeVisible();
    await expect(page.getByText("Đã đặt").first()).toBeVisible();

    await page.getByRole("combobox", { name: "Toà nhà" }).click();
    await page.getByRole("option", { name: "Căn hộ Dịch Vụ Cao Cấp" }).click();
    await page.getByRole("button", { name: "Quay lại" }).click();
    await expect(page.getByText("10 phòng được tìm thấy")).toBeVisible();
  });
});
