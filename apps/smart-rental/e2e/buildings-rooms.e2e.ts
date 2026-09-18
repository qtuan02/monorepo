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

  test("shows the whole Phòng grid grouped by floor, with no pagination", async ({
    page,
  }) => {
    await page.goto(ROUTES.ROOMS);
    await expect(
      page.getByRole("heading", { name: "Danh sách phòng" }),
    ).toBeVisible();
    // 18 Phòng total (6 + 8 + 4) — the resultLabel counts the whole scope
    // even though the grid view never pages it (spec #153 §10 row 43).
    await expect(page.getByText("18 phòng được tìm thấy")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tầng 5" })).toBeVisible();
    // The last floor's last card is on screen with no "Trang sau" to click.
    await expect(page.getByText("Phòng 208")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Trang sau" }),
    ).not.toBeVisible();
  });

  test("keeps the Phòng search, facet and page on the URL across a reload (dạng bảng)", async ({
    page,
  }) => {
    await page.goto(ROUTES.ROOMS);
    await page.getByRole("button", { name: "Dạng bảng" }).click();
    await expect(page).toHaveURL(/view=table/);

    // `.first()` — the toolbar's facet trigger, not the table's own
    // "Trạng thái" sortable column header, which carries the same name and
    // sits later in the DOM.
    await page.getByRole("button", { name: "Trạng thái" }).first().click();
    await page.getByRole("checkbox", { name: /Trống/ }).click();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/status=available/);
    // Trống: R-B1-101, R-B2-203, R-B3-303.
    await expect(page.getByText("3 phòng được tìm thấy")).toBeVisible();

    await page.getByRole("searchbox").fill("Phòng 3");
    await expect(page).toHaveURL(/q=Ph/);
    // Only R-B3-303 is both "Phòng 3…" and Trống.
    await expect(page.getByText("1 phòng được tìm thấy")).toBeVisible();

    await page.reload();
    await expect(page.getByText("1 phòng được tìm thấy")).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveValue("Phòng 3");

    await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
    await expect(page).toHaveURL(/view=table/);
    await page.getByRole("button", { name: "Trang sau" }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.reload();
    // 18 rows, 12/page → page 2 is rows 13–18.
    await expect(page.getByText("13–18")).toBeVisible();
  });

  test("switches the Phòng list to the table and sorts a column", async ({
    page,
  }) => {
    await page.goto(ROUTES.ROOMS);
    // Ticket #157 — the view switch is a real `ToggleGroup` now (component
    // map: a switch has no panel, so `Tabs` was the wrong semantics), a
    // button rather than a tab.
    await page.getByRole("button", { name: "Dạng bảng" }).click();
    await expect(page).toHaveURL(/view=table/);
    await expect(page.getByRole("table")).toBeVisible();

    // A numeric column sorts descending first (TanStack's `sortDescFirst`).
    await page.getByRole("button", { name: "Giá thuê" }).click();
    await expect(page.getByRole("row").nth(1)).toContainText("6.000.000");
    await page.getByRole("button", { name: "Giá thuê" }).click();
    await expect(page.getByRole("row").nth(1)).toContainText("2.500.000");
  });

  test("creates a Phòng through the FormSheet and toasts", async ({ page }) => {
    await page.goto(ROUTES.ROOMS);
    await page.getByRole("button", { name: "Thêm phòng" }).click();

    const sheet = page.getByRole("dialog", { name: "Thêm phòng mới" });
    await sheet.getByRole("button", { name: "Lưu lại" }).click();
    await expect(sheet.getByText("Chọn một toà nhà")).toBeVisible();

    await sheet.getByLabel("Toà nhà").click();
    await page.getByRole("option", { name: "Trọ Sinh Viên Xanh" }).click();
    await sheet.getByLabel("Tên phòng").fill("Phòng E2E");
    await sheet.getByLabel(/Giá thuê/).fill("3000000");
    await sheet.getByRole("button", { name: "Lưu lại" }).click();

    await expect(page.getByText("Đã thêm phòng Phòng E2E")).toBeVisible();
    await expect(page.getByText("Phòng E2E", { exact: true })).toBeVisible();
  });

  test("deletes an empty Phòng, and disables the button with a reason while a contract is live", async ({
    page,
  }) => {
    // R-B1-102 has a live Hợp đồng — the button is disabled with a tooltip.
    await page.goto(ROUTES.roomDetailPath("R-B1-102"));
    const busyDelete = page.getByRole("button", { name: "Xóa" });
    await expect(busyDelete).toBeDisabled();
    await busyDelete.hover({ force: true });
    await expect(
      page.getByText("Phòng còn hợp đồng hiệu lực, không thể xoá."),
    ).toBeVisible();

    // R-B1-101 has none — delete goes through the confirm dialog.
    await page.goto(ROUTES.roomDetailPath("R-B1-101"));
    await page.getByRole("button", { name: "Xóa" }).click();
    await page
      .getByRole("alertdialog", { name: "Xóa phòng" })
      .getByRole("button", { name: "Xóa" })
      .click();

    await expect(page.getByText("Đã xóa Phòng 101")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.ROOMS}$`));
  });

  test("creates a Toà nhà through the FormSheet and toasts", async ({
    page,
  }) => {
    await page.goto(ROUTES.BUILDINGS);
    // The card title, not a bare page-wide getByText — the header's own
    // Building scope tabs repeat every Toà nhà's name too, and both sit
    // inside the same `<main>` (`SidebarInset` renders one).
    await expect(
      page.locator('[data-slot="card-title"]', {
        hasText: "Trọ Sinh Viên Xanh",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Thêm toà nhà" }).click();
    await page.getByRole("button", { name: "Lưu lại" }).click();
    await expect(
      page.getByText("Tên toà nhà phải có ít nhất 2 ký tự"),
    ).toBeVisible();

    await page.getByLabel("Tên toà nhà").fill("Trọ E2E");
    await page.getByLabel("Địa chỉ").fill("1 Đường Kiểm Thử, Đà Nẵng");
    await page.getByRole("button", { name: "Lưu lại" }).click();

    await expect(page.getByText("Đã thêm toà nhà Trọ E2E")).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]', { hasText: "Trọ E2E" }),
    ).toBeVisible();
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
    await expect(page.getByText("Đã thuê").first()).toBeVisible();

    await page.getByRole("button", { name: "Căn hộ Dịch Vụ Cao Cấp" }).click();
    await page.getByRole("button", { name: "Quay lại" }).click();
    // b2 (Căn hộ Dịch Vụ Cao Cấp) has 8 Phòng.
    await expect(page.getByText("8 phòng được tìm thấy")).toBeVisible();
  });
});
