import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { ROUTES } from "~/constants/routes";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { getReconciliationStats } from "~/features/reconciliation/utils/reconciliation-stats";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { formatFullDate } from "~/utils/date";
import { deriveInvoiceStatus } from "~/utils/invoice-status";
import { buildReconciliationItems } from "~/utils/reconciliation-items";

// The one seam of spec #127: the route tree mounted at a path, asserting what
// the landlord sees. Every domain ticket adds its rows here; a page that fails
// to import, a route wired to the wrong template, or a guard that moved, all
// fail on this table rather than on a hand-fed prop.

// The real store, driven through its own API — mocking the module would throw
// away the selector behaviour the guards depend on.
const initialAuthState = useAuthStore.getState();
const initialBuildingState = useBuildingStore.getState();

/**
 * A data router with one splat route around `<AppRoutes />`, rather than a
 * `MemoryRouter`: only a data router exposes `state.historyAction`, which is
 * what proves a guard bounced with `replace` and not `push`.
 *
 * A fresh `QueryClient` per render, the provider `MainApp` gives the tree: the
 * shell's Building scope selector reads its Toà nhà through `~/hooks/api`.
 */
function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [path],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

function heading(name: string) {
  return screen.getByRole("heading", { level: 1, name });
}

// A row per route in `ROUTES`: the builders get a sample id, and the id shows
// up in the placeholder so a page that dropped its param is caught too. A
// ported screen adds a third column — text only its Mock can put on screen —
// so a route wired to a placeholder, or a Mock that stopped flowing, fails.
// "Hôm nay" is its own describe block below — its heading is the day's
// date, not a literal string, and it needs a Building scope round trip.
const guardedScreens: [path: string, heading: string, mockText?: string][] = [
  [ROUTES.BUILDINGS, "Toà nhà", "Trọ Sinh Viên Xanh"],
  [
    ROUTES.buildingDetailPath("b2"),
    "Chi tiết toà nhà",
    "Căn hộ Dịch Vụ Cao Cấp",
  ],
  [ROUTES.ROOMS, "Phòng", "Phòng 101"],
  [ROUTES.roomDetailPath("R-B1-102"), "Chi tiết phòng", "Phòng 102"],
  [ROUTES.TENANTS, "Người thuê", "Trần Thị B"],
  [ROUTES.tenantDetailPath("T003"), "Chi tiết Người thuê", "Lê Văn C"],
  [ROUTES.CONTRACTS, "Hợp đồng", "HĐ-002"],
  [ROUTES.CONTRACT_CREATE, "Tạo hợp đồng mới"],
  [ROUTES.contractDetailPath("C004"), "Chi tiết hợp đồng", "HĐ-004"],
  [ROUTES.contractRenewPath("C004"), "Gia hạn hợp đồng", "HĐ-004"],
  [ROUTES.contractLiquidationPath("C004"), "Thanh lý hợp đồng", "HĐ-004"],
  [ROUTES.INVOICES, "Hoá đơn", "HÓA-001"],
  // Scope null: both now require picking one Toà nhà first (spec #153 §10
  // row 4) — the guard panel's own heading, not the form's mock text; see
  // the dedicated "Building scope required" tests below for the full round
  // trip once a Toà nhà is selected.
  [ROUTES.INVOICE_BATCH, "Tạo hoá đơn hàng loạt"],
  [ROUTES.invoiceDetailPath("I002"), "Chi tiết hoá đơn", "HÓA-002"],
  [ROUTES.UTILITIES, "Chỉ số điện nước", "Phòng 102"],
  [ROUTES.METER_INPUT, "Nhập chỉ số điện nước"],
  [
    ROUTES.utilityDetailPath("util-202609-R-B1-102-d"),
    "Chi tiết chỉ số điện nước",
    "Phòng 102",
  ],
  [ROUTES.SUPPLIER_BILLS, "Hoá đơn nhà cung cấp", "EVN Đà Nẵng"],
  [
    ROUTES.supplierBillDetailPath("sb-b1-water-2026-04"),
    "Chi tiết hoá đơn nhà cung cấp",
    "Dawaco",
  ],
  [ROUTES.EXPENSES, "Chi phí", "Thay bóng đèn hành lang tầng 1-3"],
  [
    ROUTES.expenseDetailPath("exp-3"),
    "Chi tiết chi phí",
    "Chi phí bảo vệ ca đêm",
  ],
  // Ba màn mất Mock ở #154 (ADR-0012) — #155 tính lại từ Hoá đơn/Hợp đồng/Chi phí.
  [ROUTES.RECONCILIATION, "Đối soát", "Tiền điện"],
  [ROUTES.TASKS, "Việc cần làm", "Gửi nhắc"],
  // Scope null (the default) shows the building comparison table, not a kỳ.
  [ROUTES.REPORTS, "Báo cáo", "Trọ Sinh Viên Xanh"],
  [ROUTES.COMPLIANCE, "Khai báo lưu trú", "Nguyễn Văn A"],
  [ROUTES.COMMUNICATIONS, "Thông báo", "ZNS: Nhắc đóng tiền nhà"],
  [ROUTES.SETTINGS, "Cài đặt", "Nguyễn Quốc Tuấn"],
];

const guestScreens: [path: string, heading: string][] = [
  [ROUTES.AUTH_LOGIN, "Đăng nhập"],
];

describe("the route tree", () => {
  it("has a row above for every static path in ROUTES", () => {
    // Guards the table itself: a path added to ROUTES without a row here
    // would otherwise be the one route nothing renders.
    const covered = new Set([
      ...guardedScreens.map(([path]) => path),
      ...guestScreens.map(([path]) => path),
      ROUTES.HOME,
    ]);
    const missing: string[] = [];
    for (const value of Object.values(ROUTES)) {
      if (typeof value !== "string" || value.includes(":")) continue;
      if (!covered.has(value)) missing.push(value);
    }

    expect(missing).toEqual([]);
  });

  beforeEach(() => {
    // `true` replaces rather than merges, so a token set by one test cannot
    // survive into the next.
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
  });

  describe("signed in", () => {
    beforeEach(() => {
      useAuthStore.setState({ token: "a-token" });
    });

    it.each(guardedScreens)("%s renders «%s»", async (path, name, mockText) => {
      renderAt(path);

      expect(heading(name)).toBeInTheDocument();
      // The Mock arrives through TanStack Query, so a tick later than the heading.
      if (mockText) {
        expect(await screen.findAllByText(mockText)).not.toHaveLength(0);
      }
    });

    // Spec #153 §10 row 9 / ADR-0012 — a fact computed at read time, on the
    // screen that shows it, rather than trusted from the Mock's own literal.
    it("shows a derived Quá hạn badge on the invoice list", async () => {
      renderAt(ROUTES.INVOICES);

      expect(await screen.findAllByText("Quá hạn")).not.toHaveLength(0);
    });

    // Ticket #157 — the KPI strip's own numbers, over the whole (unscoped)
    // Mock, the same derivation the read path applies (ADR-0012).
    //
    // `formatCurrency` interposes a NBSP before "₫" (`Intl.NumberFormat`'s
    // `vi-VN` currency format); RTL's default text normalizer only
    // normalizes the ELEMENT's own text before comparing, never the query
    // string, so a raw NBSP in the query never matches the collapsed-to-a-
    // plain-space text `getByText` actually compares against.
    const NBSP = String.fromCharCode(160);
    function withoutNbsp(text: string) {
      return text.split(NBSP).join(" ");
    }

    it("shows correct KPI totals on the invoice list", async () => {
      renderAt(ROUTES.INVOICES);

      const stats = buildInvoiceSummaryStats(
        mockInvoices.map((invoice) => ({
          ...invoice,
          status: deriveInvoiceStatus(invoice),
        })),
      );

      expect(
        await screen.findAllByText(
          withoutNbsp(formatCurrency(stats.paidAmount)),
        ),
      ).not.toHaveLength(0);
      expect(
        screen.getAllByText(withoutNbsp(formatCurrency(stats.overdueAmount))),
      ).not.toHaveLength(0);
    });

    // Ticket #165 — the default kỳ is the current month, and a pure function
    // over the very same Mock is the check: Đối soát must never drift from
    // `buildReconciliationItems`.
    it("shows the kỳ 09/2026 total the pure function computes for b1", async () => {
      renderAt(ROUTES.RECONCILIATION);

      const period = dayjs().format("YYYY-MM");
      const items = buildReconciliationItems(
        mockInvoices,
        mockSupplierBills,
        mockExpenses,
        "b1",
        period,
      );
      const stats = getReconciliationStats(items);

      expect(
        await screen.findAllByText(
          withoutNbsp(formatCurrency(stats.totalExpenseAmount)),
        ),
      ).not.toHaveLength(0);
    });

    // Ticket #184 — the "Thu tiền" entry point (spec #179 §3.3.1's bottom-nav
    // stop) is this same route with a query, not a route of its own.
    it("filters + sorts the invoice list from the URL — status=…&sort=dueDate puts an overdue invoice first", async () => {
      renderAt(`${ROUTES.INVOICES}?status=UNPAID,PARTIAL,OVERDUE&sort=dueDate`);

      const rows = await screen.findAllByRole("row");
      // rows[0] is the header row — the table default sorts ascending by
      // dueDate, so the oldest (overdue) due date leads.
      const firstDataRow = rows[1];
      if (!firstDataRow) throw new Error("expected at least one data row");
      expect(within(firstDataRow).getByText("Quá hạn")).toBeInTheDocument();
    });

    it("opens the tab named by `?tab=` on a detail screen's deep link", async () => {
      renderAt(`${ROUTES.invoiceDetailPath("I002")}?tab=payments`);

      expect(await screen.findByText("Lịch sử thanh toán")).toBeInTheDocument();
    });

    it("shows a derived Sắp hết hạn badge on the contract list", async () => {
      renderAt(ROUTES.CONTRACTS);

      expect(await screen.findAllByText("Sắp hết hạn")).not.toHaveLength(0);
    });

    it("shows a derived Đang thuê badge on the tenant list", async () => {
      renderAt(ROUTES.TENANTS);

      expect(await screen.findAllByText("Đang thuê")).not.toHaveLength(0);
    });

    // Ticket #161 — "tạo/sửa trong FormSheet", never a separate page (there is
    // no ROUTES.TENANT_CREATE any more); a form with ≥ 2 errors gets a
    // focusable summary on top of each field's own inline FieldError.
    it("opens the Người thuê FormSheet with an error summary at ≥ 2 errors", async () => {
      const user = userEvent.setup();
      renderAt(ROUTES.TENANTS);

      await user.click(screen.getByRole("button", { name: "Thêm Người thuê" }));
      expect(
        screen.getByRole("heading", { name: "Thêm Người thuê mới" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Ngày sinh" }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Lưu lại" }));

      expect(
        await screen.findByText(/^Vui lòng kiểm tra lại \d+ lỗi$/),
      ).toBeInTheDocument();
    });

    it("lists a Việc cần làm item pointing at an existing Hoá đơn", async () => {
      renderAt(ROUTES.TASKS);

      expect(
        await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/),
      ).not.toHaveLength(0);
    });

    it("names the id a detail screen could not find in its Mock", async () => {
      renderAt(ROUTES.contractRenewPath("c-42"));

      expect(
        await screen.findByText("Không có hợp đồng nào với mã c-42."),
      ).toBeInTheDocument();
    });

    it.each(guestScreens)("%s bounces to the dashboard", (path) => {
      const router = renderAt(path);

      expect(router.state.location.pathname).toBe(ROUTES.HOME);
      expect(heading(formatFullDate())).toBeInTheDocument();
    });

    it("renders the 404 inside the shell for an unknown path, not sign-in", () => {
      const router = renderAt("/khong-ton-tai");

      expect(router.state.location.pathname).toBe("/khong-ton-tai");
      expect(heading("404 Không tìm thấy")).toBeInTheDocument();
      // "Inside the shell" is the sidebar being there around the 404.
      expect(screen.getByRole("link", { name: "Toà nhà" })).toBeInTheDocument();
    });

    it("marks the sidebar item of the area the path falls under", () => {
      renderAt(ROUTES.contractRenewPath("c-1"));

      // Two links share this name now — the sidebar's own item, and (while
      // the route's Hợp đồng query is still loading) the screen's own
      // breadcrumb crumb back to `/contracts` (spec #153 §3.6, §10 row 52).
      // Only the sidebar's copy ever carries `data-active`.
      const contractLinks = screen.getAllByRole("link", { name: "Hợp đồng" });
      expect(
        contractLinks.some((link) => link.hasAttribute("data-active")),
      ).toBe(true);
      // Two links share this name now — the sidebar's and the bottom nav's
      // (ADR-0011); jsdom renders both regardless of the `md:hidden` that
      // keeps only one on screen at a time, so this checks every one of them.
      for (const link of screen.getAllByRole("link", { name: "Hôm nay" })) {
        expect(link).not.toHaveAttribute("data-active");
      }
    });

    it("signs out from the nav-user menu and lands on sign-in", async () => {
      const user = userEvent.setup();
      useAuthStore.setState({
        user: { name: "Admin User", email: "admin@gmail.com" },
      });
      const router = renderAt(ROUTES.HOME);

      await user.click(screen.getByRole("button", { name: "Tài khoản" }));
      await user.click(
        await screen.findByRole("menuitem", { name: "Đăng xuất" }),
      );

      expect(useAuthStore.getState().token).toBeNull();
      expect(router.state.location.pathname).toBe(ROUTES.AUTH_LOGIN);
      expect(heading("Đăng nhập")).toBeInTheDocument();
    });
  });

  describe("signed out", () => {
    it.each(guestScreens)(
      "%s renders «%s» with no shell around it",
      (path, name) => {
        renderAt(path);

        expect(heading(name)).toBeInTheDocument();
        expect(
          screen.queryByRole("link", { name: "Toà nhà" }),
        ).not.toBeInTheDocument();
      },
    );

    it("bounces a guarded route to sign-in with `replace`", () => {
      const router = renderAt(ROUTES.BUILDINGS);

      expect(router.state.location.pathname).toBe(ROUTES.AUTH_LOGIN);
      // `replace`, so Back cannot walk into the route just bounced out of.
      expect(router.state.historyAction).toBe("REPLACE");
      expect(heading("Đăng nhập")).toBeInTheDocument();
    });
  });
});

// Ticket #159 — the shell's "Hôm nay" (ADR-0011): the heading is today's
// date, the queue is Việc cần làm from the same Mock `/tasks` reads, and the
// Building scope tabs above it are what every screen (this one included)
// now reads through.
describe("Hôm nay", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
    useAuthStore.setState({ token: "a-token" });
  });

  it("names the day, not the area — «Hôm nay» is the header's/sidebar's name for it", async () => {
    renderAt(ROUTES.HOME);

    expect(heading(formatFullDate())).toBeInTheDocument();
    expect(await screen.findAllByText("Hôm nay")).not.toHaveLength(0);
  });

  it("shows at least five Việc cần làm from the Mock", async () => {
    renderAt(ROUTES.HOME);

    await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(5);
  });

  // ADR-0013 — "Kỳ chưa lập Đợt" only fires once the Kỳ's own ngày chốt
  // (cuối tháng) has passed; the Mock's current Kỳ 09 is still mid-month, so
  // this is never a Việc yet at "hôm nay" (see `~/utils/task-derivation`,
  // covered with a pinned `today` past cuối tháng).
  it("does not show a «chưa lập Đợt» task before the Kỳ's ngày chốt has passed", async () => {
    renderAt(ROUTES.HOME);

    await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/);
    expect(screen.queryByText(/chưa lập Đợt hoá đơn/)).not.toBeInTheDocument();
  });

  it("scopes the queue to just its own Toà nhà once one is selected", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderAt(ROUTES.HOME);

    // C001 (b1, Nguyễn Văn A) is quá hạn — present; C012 (b3, Phan Thị M) is
    // quá hạn too, but scoped OUT once b1 is selected.
    expect(
      await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/),
    ).not.toHaveLength(0);
    expect(screen.getAllByText(/Nguyễn Văn A/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Phan Thị M/)).not.toBeInTheDocument();
  });

  it("navigates a Việc cần làm action to the entity's own, existing route", async () => {
    const user = userEvent.setup();
    renderAt(ROUTES.HOME);

    const titles = await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/);
    const item = titles[0]?.closest('[role="listitem"]');
    expect(item).not.toBeFalsy();

    await user.click(
      within(item as HTMLElement).getByRole("link", { name: "Xem" }),
    );

    expect(heading("Chi tiết hoá đơn")).toBeInTheDocument();
  });
});

// Ticket #161, spec #153 §10 row 8 — marking Thông báo lưu trú "Đã gửi" is
// the one write Khai báo lưu trú has, and it is what makes the matching
// residence_notification task drop off Hôm nay (AC: "test qua route tree").
describe("Khai báo lưu trú — đánh dấu Đã gửi", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
    useAuthStore.setState({ token: "a-token" });
  });

  it("marks Thông báo lưu trú sent and drops the tenant's Việc cần làm", async () => {
    const user = userEvent.setup();
    renderAt(ROUTES.COMPLIANCE);

    // T005 (Hoàng Văn E) is the one tenant the Mock deliberately ships with
    // no Thông báo lưu trú record yet (see `constants/mock/compliance.ts`).
    const name = await screen.findByText("Hoàng Văn E");
    const row = name.closest('[data-slot="residence-declaration-row"]');
    expect(row).not.toBeNull();

    await user.click(
      within(row as HTMLElement).getByRole("button", { name: "Đã gửi" }),
    );
    await within(row as HTMLElement).findAllByText("Đã gửi");

    renderAt(ROUTES.TASKS);
    await screen.findAllByText(/^Hoá đơn HÓA-\d+ quá hạn$/);
    expect(
      screen.queryByText("Hoàng Văn E chưa có Thông báo lưu trú"),
    ).not.toBeInTheDocument();
  });
});

// Ticket #159, spec #153 §10 row 4 — the two forms that need exactly one
// Toà nhà rather than "every Toà nhà" or "no Toà nhà".
describe("Building scope required — Đợt hoá đơn, Nhập chỉ số", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
    useAuthStore.setState({ token: "a-token" });
  });

  it("blocks Đợt hoá đơn until a Toà nhà is chosen", async () => {
    renderAt(ROUTES.INVOICE_BATCH);

    expect(
      await screen.findByText("Chọn một Toà nhà trước khi tiếp tục"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nguyễn Văn A")).not.toBeInTheDocument();
  });

  it("shows the Đợt hoá đơn form once a Toà nhà is selected", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderAt(ROUTES.INVOICE_BATCH);

    expect(await screen.findAllByText("Nguyễn Văn A")).not.toHaveLength(0);
  });

  it("blocks Nhập chỉ số until a Toà nhà is chosen", () => {
    renderAt(ROUTES.METER_INPUT);

    expect(
      screen.getByText("Chọn một Toà nhà trước khi tiếp tục"),
    ).toBeInTheDocument();
  });

  it("shows the Nhập chỉ số form once a Toà nhà is selected", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderAt(ROUTES.METER_INPUT);

    expect(await screen.findAllByText("Phòng 102")).not.toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Lưu 0 chỉ số" }),
    ).toBeInTheDocument();
  });
});

// Spec #153 §10 row 32 (AC: "xoá một Phòng, reset, Phòng trở lại") — each
// `renderAt` mounts a fresh QueryClient, so this only proves something if the
// Mock array itself, not a cache, is what came back.
describe("Khôi phục dữ liệu mẫu — Cài đặt", () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
    useAuthStore.setState({ token: "a-token" });
  });

  it("restores a deleted Phòng once Khôi phục dữ liệu mẫu confirms", async () => {
    const user = userEvent.setup();

    // R-B3-303 carries no Hợp đồng at all — deletable from the start. A
    // successful delete navigates away to the Phòng list, so the signal to
    // wait on is that navigation, not a 404 on this same page.
    renderAt(ROUTES.roomDetailPath("R-B3-303"));
    await user.click(await screen.findByRole("button", { name: "Xóa" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Xóa",
      }),
    );
    await screen.findByRole("heading", { level: 1, name: "Phòng" });

    renderAt(ROUTES.SETTINGS);
    await user.click(
      await screen.findByRole("button", { name: "Khôi phục dữ liệu mẫu" }),
    );
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Khôi phục",
      }),
    );
    // The dialog only closes from the mutation's onSuccess — waiting for it
    // to disappear is waiting for the reset itself to have run.
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    renderAt(ROUTES.roomDetailPath("R-B3-303"));
    expect(await screen.findAllByText("Phòng 303")).not.toHaveLength(0);
    expect(screen.queryByText("Không tìm thấy phòng.")).not.toBeInTheDocument();
  });
});
