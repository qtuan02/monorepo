import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it } from "vitest";

import { mockInvoices } from "~/constants/mock/invoices";
import { ROUTES } from "~/constants/routes";
import { buildInvoiceSummaryStats } from "~/features/invoices/utils/invoice-calculations";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

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
const guardedScreens: [path: string, heading: string, mockText?: string][] = [
  [ROUTES.HOME, "Hôm nay"],
  [ROUTES.BUILDINGS, "Quản lý Toà nhà", "Trọ Sinh Viên Xanh"],
  [
    ROUTES.buildingDetailPath("b2"),
    "Chi tiết toà nhà",
    "Căn hộ Dịch Vụ Cao Cấp",
  ],
  [ROUTES.ROOMS, "Danh sách phòng", "Phòng 101"],
  [ROUTES.roomDetailPath("R-B1-102"), "Chi tiết phòng", "Phòng 102"],
  [ROUTES.TENANTS, "Quản lý Người thuê", "Trần Thị B"],
  [ROUTES.tenantDetailPath("T003"), "Chi tiết Người thuê", "Lê Văn C"],
  [ROUTES.CONTRACTS, "Quản lý hợp đồng", "HĐ-002"],
  [ROUTES.CONTRACT_CREATE, "Tạo hợp đồng mới"],
  [ROUTES.contractDetailPath("C004"), "Chi tiết hợp đồng", "HĐ-004"],
  [ROUTES.contractRenewPath("C004"), "Gia hạn hợp đồng", "HĐ-004"],
  [ROUTES.contractLiquidationPath("C004"), "Thanh lý hợp đồng", "HĐ-004"],
  [ROUTES.INVOICES, "Quản lý hoá đơn", "HÓA-001"],
  [ROUTES.INVOICE_BATCH, "Tạo hoá đơn hàng loạt", "Nguyễn Văn A"],
  [ROUTES.invoiceDetailPath("I002"), "Chi tiết hoá đơn", "HÓA-002"],
  [ROUTES.UTILITIES, "Chỉ số điện nước", "Phòng 102"],
  [ROUTES.METER_INPUT, "Nhập chỉ số điện nước", "1000"],
  [
    ROUTES.utilityDetailPath("util-202609-R-B1-102-d"),
    "Chi tiết chỉ số điện nước",
    "Phòng 102",
  ],
  [ROUTES.SUPPLIER_BILLS, "Hoá đơn nhà cung cấp", "Viettel Business"],
  [
    ROUTES.supplierBillDetailPath("sb2"),
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
  [ROUTES.TASKS, "Việc cần làm", "Hoá đơn quá hạn"],
  [ROUTES.REPORTS, "Báo cáo", "04/2026"],
  [ROUTES.COMPLIANCE, "Khai báo lưu trú", "Nguyễn Văn A"],
  [ROUTES.COMMUNICATIONS, "Thông báo", "ZNS: Nhắc đóng tiền nhà"],
  [ROUTES.SETTINGS, "Cài đặt hệ thống", "Nhà trọ Quốc Tế"],
];

const guestScreens: [path: string, heading: string][] = [
  [ROUTES.AUTH_LOGIN, "Đăng nhập"],
  [ROUTES.AUTH_REGISTER, "Đăng ký tài khoản"],
];

describe("the route tree", () => {
  it("has a row above for every static path in ROUTES", () => {
    // Guards the table itself: a path added to ROUTES without a row here
    // would otherwise be the one route nothing renders.
    const covered = new Set([
      ...guardedScreens.map(([path]) => path),
      ...guestScreens.map(([path]) => path),
      ROUTES.ONBOARDING,
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

      await user.click(
        screen.getByRole("button", { name: "Thêm Người thuê" }),
      );
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
      expect(heading("Hôm nay")).toBeInTheDocument();
    });

    it("renders onboarding — chromeless, like the guest screens", () => {
      renderAt(ROUTES.ONBOARDING);

      expect(heading("Chào mừng!")).toBeInTheDocument();
      expect(screen.getByLabelText("Tên khu trọ")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Toà nhà" }),
      ).not.toBeInTheDocument();
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

      expect(screen.getByRole("link", { name: "Hợp đồng" })).toHaveAttribute(
        "data-active",
      );
      expect(screen.getByRole("link", { name: "Hôm nay" })).not.toHaveAttribute(
        "data-active",
      );
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

    it("renders onboarding — it sits outside both guards", () => {
      renderAt(ROUTES.ONBOARDING);

      expect(heading("Chào mừng!")).toBeInTheDocument();
      expect(screen.getByLabelText("Tên khu trọ")).toBeInTheDocument();
    });
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
