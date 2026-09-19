import { readFile } from "node:fs/promises";
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
    await expect(page.getByText("84 hoá đơn")).toBeVisible();

    await page.getByRole("button", { name: "Căn hộ Dịch Vụ Cao Cấp" }).click();
    await expect(page.getByText("36 hoá đơn")).toBeVisible();

    // "Chỉ số điện nước" is no longer its own sidebar row (ADR-0013) — go
    // straight there; the Building scope carries over via the store.
    await page.goto(ROUTES.UTILITIES);
    await expect(page.getByText("22 chỉ số")).toBeVisible();
  });

  // Ticket #157 — the list-screen foundation, proven on Hoá đơn: the KPI
  // strip, row selection → the sticky action bar, and — at 390 px, where the
  // table gives way to an Item list — no horizontal overflow. Ticket #167
  // (spec #153, tổng kiểm) adds the bottom nav and the KPI strip's own
  // horizontal scroll to the same 390 px assertion, on this same screen.
  test("shows the KPI strip and the selection bar on desktop; the mobile shell (bottom nav, Item list, scrollable KPI) at 390 px", async ({
    page,
  }) => {
    await page.goto(ROUTES.INVOICES);

    const kpiStrip = page.locator('[data-slot="kpi-strip"]');
    await expect(kpiStrip.getByText("Đã thu", { exact: true })).toBeVisible();
    await expect(kpiStrip.getByText("Quá hạn", { exact: true })).toBeVisible();
    await expect(
      kpiStrip.getByText("Thu một phần", { exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Dạng bảng" }).click();
    const rows = page.getByRole("row");
    await rows.nth(1).getByRole("checkbox", { name: "Chọn dòng" }).click();
    await rows.nth(2).getByRole("checkbox", { name: "Chọn dòng" }).click();

    await expect(page.getByText("Đã chọn 2", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Gửi nhắc" }).click();
    await page
      .getByRole("dialog", { name: "Gửi nhắc thanh toán" })
      .getByRole("button", { name: "Gửi", exact: true })
      .click();
    await expect(page.getByText("Đã chọn 2", { exact: true })).toBeHidden();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("table")).toBeHidden();
    await expect(
      page.locator('[data-slot="data-table-mobile-row"]').first(),
    ).toBeVisible();
    // The card/table choice is moot at phone width — hidden below `md`.
    await expect(page.getByRole("button", { name: "Dạng bảng" })).toBeHidden();
    // The content column's own scrollWidth, not documentElement's — a
    // horizontal overflow inside the card is exactly what C.1 #10/#12 found.
    const contentWidth = await page.evaluate(() => {
      const content = document.querySelector("main");
      return content ? content.scrollWidth - content.clientWidth : 0;
    });
    expect(contentWidth).toBeLessThanOrEqual(1);

    // The sidebar gives way to the bottom nav on this screen too — the shell
    // spec proves the swap once for the whole app, this proves it holds here.
    const bottomNav = page.getByRole("navigation", {
      name: "Điều hướng chính",
    });
    await expect(bottomNav).toBeVisible();
    // Bottom nav ô 4 is "Thu tiền" (spec #179 §"IA / shell") — the same
    // /invoices route, so it still marks active while on this screen.
    await expect(
      bottomNav.getByRole("link", { name: "Thu tiền", exact: true }),
    ).toHaveAttribute("data-active");

    // The KPI strip itself overflows into a horizontal scroll at 390 px
    // rather than shrinking its three tiles unreadably (spec #153 §10 row 16).
    const kpiOverflow = await kpiStrip.evaluate(
      (el) => el.scrollWidth - el.clientWidth,
    );
    expect(kpiOverflow).toBeGreaterThan(0);
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

  // Ticket #164, spec #153 §10 row 12/13 — "Xuất CSV các hàng đang lọc".
  test("exports the currently-filtered Hoá đơn rows as CSV", async ({
    page,
  }) => {
    await page.goto(ROUTES.INVOICES);
    // `.first()` — the toolbar's facet trigger, not the table's own sortable
    // "Trạng thái" column header, which carries the same accessible name.
    await page.getByRole("button", { name: "Trạng thái" }).first().click();
    await page.getByRole("checkbox", { name: "Quá hạn" }).click();
    await page.keyboard.press("Escape");

    // Filtering: the toolbar switches to "M / 84 hoá đơn" (round 4 Q3).
    const resultLabel = page.getByText(/^\d+ \/ 84 hoá đơn$/);
    await expect(resultLabel).toBeVisible();
    const filteredCount = Number(
      (await resultLabel.textContent())?.match(/^\d+/)?.[0],
    );
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(84);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Xuất CSV" }).click(),
    ]);
    const csvPath = await download.path();
    if (!csvPath) throw new Error("Xuất CSV không tạo được file tải xuống.");
    const csv = await readFile(csvPath, "utf-8");
    // Header row + one row per filtered Hoá đơn — never the whole, unfiltered list.
    expect(csv.trim().split("\n")).toHaveLength(filteredCount + 1);
  });

  // Ticket #164, spec #153 §10 row 12 — "in hoá đơn bằng window.print".
  test("in hoá đơn calls window.print", async ({ page }) => {
    await page.goto(ROUTES.invoiceDetailPath("I071"));
    await page.evaluate(() => {
      (window as { __printCalled?: boolean }).__printCalled = false;
      window.print = () => {
        (window as { __printCalled?: boolean }).__printCalled = true;
      };
    });

    await page.getByRole("button", { name: "In hoá đơn" }).click();

    expect(
      await page.evaluate(
        () => (window as { __printCalled?: boolean }).__printCalled,
      ),
    ).toBe(true);
  });

  // Ticket #182/#183, ADR-0013 — "Kỳ điện nước & hoá đơn" replaced Đợt hoá
  // đơn + Nhập chỉ số, and a kỳ after the current one "không mở" (read-only,
  // no action bar at all) rather than only disabling Lập — the Mock has no
  // Chỉ số for it either, so the row still says Thiếu chỉ số, but there is
  // no "Lập" button left to be disabled.
  test("Kỳ: a future month is read-only and shows Thiếu chỉ số", async ({
    page,
  }) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const month = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

    await page.goto(ROUTES.cycleDetailPath(month));
    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();

    await expect(page.getByText("Kỳ tương lai — chưa mở.")).toBeVisible();
    const row = page.getByRole("row", { name: "Phòng 102" });
    await expect(row.getByText("Thiếu chỉ số")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Lập \d+ hoá đơn/ }),
    ).toHaveCount(0);
  });

  // Kỳ 09/2026 is the Mock's "đang chốt dở" kỳ (ADR-0013): a READY Phòng,
  // an ANOMALY one, and one still MISSING — chỉ số mới arrives pre-filled
  // from the saved Nháp, and Lập stays disabled until the kỳ's ngày chốt.
  test("Kỳ hiện tại: chỉ số mới điền sẵn Nháp; Lập vẫn khoá trước ngày chốt", async ({
    page,
  }) => {
    await page.goto(ROUTES.cycleDetailPath("2026-09"));
    await page.getByRole("button", { name: "Trọ Sinh Viên Xanh" }).click();

    // Cells join with no separator, so a plain substring match still lands
    // on the one row that starts with it.
    const readyRow = page.getByRole("row", { name: "Phòng 102" });
    await expect(readyRow.getByText("Sẵn sàng")).toBeVisible();
    await expect(
      readyRow.getByLabel("Chỉ số điện mới phòng Phòng 102"),
    ).not.toHaveValue("");

    // Round 4 (ticket #247): the Trạng thái cell shows the per-đồng-hồ compact
    // badge ("Điện ×2,2") + a "Duyệt" button instead of a plain "Bất thường".
    const anomalyRow = page.getByRole("row", { name: "Phòng 103" });
    await expect(anomalyRow.getByText(/^Điện ×/)).toBeVisible();
    await expect(
      anomalyRow.getByRole("button", { name: "Duyệt" }),
    ).toBeVisible();

    const missingRow = page.getByRole("row", { name: "Phòng 106" });
    await expect(missingRow.getByText("Thiếu chỉ số")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /^Lập \d+ hoá đơn$/ }),
    ).toBeDisabled();
  });
});
