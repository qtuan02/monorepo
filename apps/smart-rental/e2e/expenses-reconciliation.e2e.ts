import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { signIn } from "./support/auth-session";

// Ticket #165: Chi phí, Hoá đơn nhà cung cấp, Đối soát on the shared
// list/detail/form baseline — what only the real bundle proves: a FormSheet
// create ending in a toast, a delete round trip, and Đối soát's kỳ picker
// actually re-fetching (not just filtering client-side).
test.describe("Chi phí, Hoá đơn nhà cung cấp, Đối soát", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("creates a Chi phí through the FormSheet and toasts", async ({
    page,
  }) => {
    await page.goto(ROUTES.EXPENSES);
    // Scope to one Toà nhà first — the unscoped list already has 19 rows
    // over more than one page, and the new one lands at the end of it.
    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();
    await page.getByRole("button", { name: "Thêm chi phí" }).click();

    const sheet = page.getByRole("dialog", { name: "Thêm khoản chi" });
    await sheet.getByRole("button", { name: "Lưu lại" }).click();
    // Toà nhà is already prefilled from the selected Building scope
    // (`defaultBuildingId`) — Danh mục is the field that's actually empty.
    await expect(
      sheet.locator('[data-slot="field-error"]', { hasText: "Nhập danh mục" }),
    ).toBeVisible();

    await sheet.getByLabel("Danh mục").fill("Kiểm thử E2E");
    await sheet.getByLabel("Số tiền").fill("500000");
    await sheet.getByRole("button", { name: "Ngày chi" }).click();
    await page.getByRole("button", { name: /15th/ }).click();
    await sheet.getByRole("button", { name: "Lưu lại" }).click();

    await expect(page.getByText("Đã thêm khoản chi")).toBeVisible();
    await expect(page.getByText("Kiểm thử E2E").first()).toBeVisible();
  });

  test("deletes a Chi phí through the confirm dialog and lands back on the list", async ({
    page,
  }) => {
    await page.goto(ROUTES.expenseDetailPath("exp-1"));
    await expect(page.getByRole("heading", { name: "Bảo trì" })).toBeVisible();

    await page.getByRole("button", { name: "Xóa" }).click();
    await page
      .getByRole("alertdialog", { name: "Xóa khoản chi" })
      .getByRole("button", { name: "Xóa" })
      .click();

    await expect(page.getByText("Đã xóa khoản chi")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.EXPENSES}$`));
  });

  test("shows a Hoá đơn nhà cung cấp's derived trạng thái on its detail", async ({
    page,
  }) => {
    // sb-b2-water-2026-09 carries no paymentDate yet (kỳ hiện tại) — pending.
    await page.goto(ROUTES.supplierBillDetailPath("sb-b2-water-2026-09"));
    await expect(page.getByRole("heading", { name: "Dawaco" })).toBeVisible();
    await expect(page.getByText("Chờ thanh toán")).toBeVisible();
  });

  test("shows one Đối soát block per Toà nhà with no scope picked, and a kỳ switch changes the totals", async ({
    page,
  }) => {
    await page.goto(ROUTES.RECONCILIATION);
    await expect(
      page.getByRole("heading", { name: "Trọ Sinh Viên Xanh" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Căn hộ Dịch Vụ Cao Cấp" }),
    ).toBeVisible();

    // Scoped through the strip's own `data-slot`, the established way this
    // app's specs avoid colliding with a `StatusBadge` reading the same text
    // (see e.g. the KPI scoping in supplier-bill/invoice specs) — never an
    // XPath sibling crawl.
    const totalTile = page
      .locator('[data-slot="kpi-strip"] > div', { hasText: "Tổng chi dịch vụ" })
      .first();
    const totalsBefore = await totalTile.textContent();

    await page.getByRole("button", { name: "Chọn kỳ đối soát" }).click();
    // Stays in 2026 (the picker's default view) — 04/2026 is a real kỳ the
    // Mock covers, unlike a year with no data at all.
    await page.getByRole("button", { name: "Th 4" }).click();

    await expect.poll(() => totalTile.textContent()).not.toBe(totalsBefore);
  });

  test("Đối soát: Chênh lệch still renders after round 4 dropped its arrow icon (§10 Q16)", async ({
    page,
  }) => {
    await page.goto(ROUTES.RECONCILIATION);
    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();

    // Round 4 §10 Q16 simplified this cell's markup (no more icon + coloured
    // wrapper — the badge alone carries Lỗ/Lãi now); `lucide-react` leaving
    // the column file is guarded at the source level by `text-tier-guard`,
    // so what's worth proving here is that the figure itself still renders.
    const firstDataRow = table.getByRole("row").nth(1);
    const netAmountCell = firstDataRow.getByRole("cell").last();
    await expect(netAmountCell).toBeVisible();
    await expect(netAmountCell).not.toBeEmpty();
  });
});
