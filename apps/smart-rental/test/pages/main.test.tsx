import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { beforeEach, describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";

// The one seam of spec #127: the route tree mounted at a path, asserting what
// the landlord sees. Every domain ticket adds its rows here; a page that fails
// to import, a route wired to the wrong template, or a guard that moved, all
// fail on this table rather than on a hand-fed prop.

// The real store, driven through its own API — mocking the module would throw
// away the selector behaviour the guards depend on.
const initialAuthState = useAuthStore.getState();

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
  [ROUTES.HOME, "Tổng quan"],
  [ROUTES.BUILDINGS, "Quản lý Tòa nhà", "Trọ Sinh Viên Xanh"],
  [
    ROUTES.buildingDetailPath("b2"),
    "Chi tiết tòa nhà",
    "Căn hộ Dịch Vụ Cao Cấp",
  ],
  [ROUTES.ROOMS, "Danh sách phòng trọ", "Phòng 101"],
  [ROUTES.roomDetailPath("R-B1-102"), "Chi tiết phòng", "Phòng 102"],
  [ROUTES.TENANTS, "Quản lý khách thuê"],
  [ROUTES.TENANT_CREATE, "Thêm khách thuê mới"],
  [ROUTES.tenantDetailPath("t-1"), "Chi tiết khách thuê"],
  [ROUTES.CONTRACTS, "Quản lý hợp đồng"],
  [ROUTES.CONTRACT_CREATE, "Tạo hợp đồng mới"],
  [ROUTES.contractDetailPath("c-1"), "Chi tiết hợp đồng"],
  [ROUTES.contractRenewPath("c-1"), "Gia hạn hợp đồng"],
  [ROUTES.contractLiquidationPath("c-1"), "Thanh lý hợp đồng"],
  [ROUTES.INVOICES, "Quản lý hóa đơn"],
  [ROUTES.INVOICE_BATCH, "Tạo hóa đơn hàng loạt"],
  [ROUTES.invoiceDetailPath("i-1"), "Chi tiết hóa đơn"],
  [ROUTES.UTILITIES, "Tiện ích"],
  [ROUTES.METER_INPUT, "Nhập chỉ số điện nước"],
  [ROUTES.utilityDetailPath("u-1"), "Chi tiết chỉ số điện nước"],
  [ROUTES.SUPPLIER_BILLS, "Hóa đơn nhà cung cấp"],
  [ROUTES.supplierBillDetailPath("sb-1"), "Chi tiết hóa đơn nhà cung cấp"],
  [ROUTES.EXPENSES, "Chi phí vận hành"],
  [ROUTES.expenseDetailPath("e-1"), "Chi tiết chi phí"],
  [ROUTES.RECONCILIATION, "Đối soát chi phí"],
  [ROUTES.TASKS, "Trung tâm nhiệm vụ"],
  [ROUTES.REPORTS, "Báo cáo"],
  [ROUTES.COMPLIANCE, "Tuân thủ"],
  [ROUTES.COMMUNICATIONS, "Liên lạc"],
  [ROUTES.SETTINGS, "Cài đặt hệ thống"],
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

    it("carries the route param into a detail placeholder", () => {
      renderAt(ROUTES.contractRenewPath("c-42"));

      expect(screen.getByText("c-42")).toBeInTheDocument();
    });

    it.each(guestScreens)("%s bounces to the dashboard", (path) => {
      const router = renderAt(path);

      expect(router.state.location.pathname).toBe(ROUTES.HOME);
      expect(heading("Tổng quan")).toBeInTheDocument();
    });

    it("renders onboarding — chromeless, like the guest screens", () => {
      renderAt(ROUTES.ONBOARDING);

      expect(heading("Chào mừng!")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Tòa nhà" }),
      ).not.toBeInTheDocument();
    });

    it("renders the 404 inside the shell for an unknown path, not sign-in", () => {
      const router = renderAt("/khong-ton-tai");

      expect(router.state.location.pathname).toBe("/khong-ton-tai");
      expect(heading("404 Không tìm thấy")).toBeInTheDocument();
      // "Inside the shell" is the sidebar being there around the 404.
      expect(screen.getByRole("link", { name: "Tòa nhà" })).toBeInTheDocument();
    });

    it("marks the sidebar item of the area the path falls under", () => {
      renderAt(ROUTES.contractRenewPath("c-1"));

      expect(screen.getByRole("link", { name: "Hợp đồng" })).toHaveAttribute(
        "data-active",
      );
      expect(
        screen.getByRole("link", { name: "Tổng quan" }),
      ).not.toHaveAttribute("data-active");
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
          screen.queryByRole("link", { name: "Tòa nhà" }),
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
    });
  });
});
