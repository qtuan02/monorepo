import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarRange,
  DoorOpen,
  Gauge,
  HandCoins,
  Home,
  Receipt,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import dayjs from "@monorepo/dayjs";

import { ROUTES } from "~/constants/routes";

export interface NavigationItem {
  /** A `ROUTES` pattern (e.g. `ROUTES.CYCLE_DETAIL`), matched against the
   * pathname with react-router's `matchPath` — never the `<Link>` target. */
  match: string;
  /** The `<Link>` target. A plain string for a fixed destination, or a
   * function when it depends on "now" (Kỳ → the current month) — resolved
   * at render/click time via `resolveNavigationItemTo`, never at import. */
  to: string | (() => string);
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

/**
 * The 14 areas in sidebar order (spec #179 §"IA / shell"), grouped by chuỗi
 * việc rather than by kind: Hôm nay đứng riêng, rồi Tháng này (thứ tự =
 * thứ tự làm) · Người & phòng · Sổ sách · Hệ thống. Paths come from
 * `ROUTES` — the manifest never carried a route element here,
 * `~/pages/main.tsx` does. Copy and icons follow the glossary (ADR-0011,
 * spec #179 §7).
 *
 * Every item is named so `bottomNavItems` can pull four of them out by
 * reference rather than duplicating a path string, and `moreNavSections`
 * can filter the rest out mechanically.
 */
export const dashboardItem: NavigationItem = {
  match: ROUTES.HOME,
  to: ROUTES.HOME,
  title: "Hôm nay",
  description: "Việc cần làm hôm nay.",
  icon: Home,
};

const buildingsItem: NavigationItem = {
  match: ROUTES.BUILDINGS,
  to: ROUTES.BUILDINGS,
  title: "Toà nhà",
  description: "Quản lý danh sách Toà nhà.",
  icon: Building2,
};

/** Exported: `search-dialog`'s quick links and result-category icon read this item directly, so ⌘K always matches the sidebar's own icon. */
export const roomsItem: NavigationItem = {
  match: ROUTES.ROOMS,
  to: ROUTES.ROOMS,
  title: "Phòng",
  description: "Quản lý danh sách phòng và trạng thái.",
  icon: DoorOpen,
};

/** Exported — see `roomsItem`. */
export const tenantsItem: NavigationItem = {
  match: ROUTES.TENANTS,
  to: ROUTES.TENANTS,
  title: "Người thuê",
  description: "Theo dõi thông tin Người thuê.",
  icon: Users,
};

/** Exported — see `roomsItem`. */
export const contractsItem: NavigationItem = {
  match: ROUTES.CONTRACTS,
  to: ROUTES.CONTRACTS,
  title: "Hợp đồng",
  description: "Quản lý hợp đồng cho thuê.",
  icon: ScrollText,
};

/** Exported — see `roomsItem`. */
export const invoicesItem: NavigationItem = {
  match: ROUTES.INVOICES,
  to: ROUTES.INVOICES,
  title: "Hoá đơn",
  description: "Theo dõi thanh toán và công nợ.",
  icon: ReceiptText,
};

/**
 * "Thu tiền" — bottom nav's own ô 4 (spec #179 §"IA / shell"), the same
 * `/invoices` route filtered to còn phải thu + sắp theo hạn, not a route of
 * its own. `match` stays the bare route so active-state matching still marks
 * "Hoá đơn" (the sidebar's own row) rather than nothing; `to` carries the query.
 */
const collectPaymentItem: NavigationItem = {
  match: ROUTES.INVOICES,
  to: ROUTES.overdueInvoicesPath(),
  title: "Thu tiền",
  description: "Hoá đơn còn phải thu, sắp theo hạn.",
  icon: HandCoins,
};

/**
 * "Kỳ điện nước & hoá đơn" (ADR-0013) — always points at the CURRENT kỳ,
 * so opening it never asks the landlord to pick a month first. `to` is a
 * function so the month resolves at render/click time, never once at
 * import — the bug this ticket (#224) fixes: a tab left open past midnight
 * on the 1st used to keep linking to the stale month. Replaces the old Đợt
 * hoá đơn + Nhập chỉ số entries; `/utilities` stays reachable (a Phòng's
 * own Chỉ số tab, and this screen's "Xem các Kỳ trước") but is no longer a
 * sidebar row of its own.
 */
const cyclesItem: NavigationItem = {
  match: ROUTES.CYCLE_DETAIL,
  to: () => ROUTES.cycleDetailPath(dayjs().format("YYYY-MM")),
  title: "Kỳ điện nước & hoá đơn",
  description: "Chốt chỉ số điện nước và lập hoá đơn theo kỳ.",
  icon: CalendarRange,
};

const supplierBillsItem: NavigationItem = {
  match: ROUTES.SUPPLIER_BILLS,
  to: ROUTES.SUPPLIER_BILLS,
  title: "Hoá đơn nhà cung cấp",
  description: "Quản lý hoá đơn từ nhà cung cấp dịch vụ.",
  icon: Receipt,
};

const expensesItem: NavigationItem = {
  match: ROUTES.EXPENSES,
  to: ROUTES.EXPENSES,
  title: "Chi phí",
  description: "Quản lý các khoản chi phí hoạt động.",
  icon: Wallet,
};

const reconciliationItem: NavigationItem = {
  match: ROUTES.RECONCILIATION,
  to: ROUTES.RECONCILIATION,
  title: "Đối soát",
  description: "Đối soát thu chi theo Toà nhà.",
  icon: Banknote,
};

const reportsItem: NavigationItem = {
  match: ROUTES.REPORTS,
  to: ROUTES.REPORTS,
  title: "Báo cáo",
  description: "Xem báo cáo doanh thu, chi phí và hiệu suất.",
  icon: BarChart3,
};

const complianceItem: NavigationItem = {
  match: ROUTES.COMPLIANCE,
  to: ROUTES.COMPLIANCE,
  title: "Khai báo lưu trú",
  description: "Thông báo lưu trú và Đăng ký tạm trú của Người thuê.",
  icon: ShieldCheck,
};

const communicationsItem: NavigationItem = {
  match: ROUTES.COMMUNICATIONS,
  to: ROUTES.COMMUNICATIONS,
  title: "Thông báo",
  description: "Gửi thông báo cho Người thuê.",
  icon: Bell,
};

const settingsItem: NavigationItem = {
  match: ROUTES.SETTINGS,
  to: ROUTES.SETTINGS,
  title: "Cài đặt",
  description: "Cấu hình hệ thống.",
  icon: Settings,
};

/** `/utilities` (list + detail) — reachable, but no longer a sidebar row (ADR-0013). */
const utilitiesItem: NavigationItem = {
  match: ROUTES.UTILITIES,
  to: ROUTES.UTILITIES,
  title: "Chỉ số điện nước",
  description: "Lịch sử chỉ số điện nước theo Phòng.",
  icon: Gauge,
};

/** Hôm nay is not a labelled group — the sidebar renders it above the four below (see `AppSidebar`). */
export const navigationSections: NavigationSection[] = [
  {
    label: "Tháng này",
    items: [cyclesItem, invoicesItem, reconciliationItem],
  },
  {
    label: "Người & phòng",
    items: [
      buildingsItem,
      roomsItem,
      tenantsItem,
      contractsItem,
      complianceItem,
    ],
  },
  {
    label: "Sổ sách",
    items: [supplierBillsItem, expensesItem, reportsItem],
  },
  {
    label: "Hệ thống",
    items: [communicationsItem, settingsItem],
  },
];

/**
 * A route reachable from the app but with no row of its own in
 * `navigationSections` — `resolveNavigationItem`'s header-title lookup still
 * needs it so `/utilities/...` reads "Chỉ số điện nước" rather than falling
 * back to "Hôm nay".
 */
export const hiddenNavigationItems: NavigationItem[] = [utilitiesItem];

/** The bottom nav's four fixed stops (spec #179 §"IA / shell") — "Thêm" is the fifth, a Sheet over `moreNavSections`. */
export const bottomNavItems: NavigationItem[] = [
  dashboardItem,
  roomsItem,
  tenantsItem,
  collectPaymentItem,
];

/**
 * Every sidebar area not already a bottom-nav stop, grouped as the sidebar
 * groups them, empty groups dropped — "Hoá đơn" is left out too, since
 * "Thu tiền" already covers it with a query. Thông báo stays (a real sidebar
 * row, spec #179 §"IA / shell" §3.1); the bell is a separate thing (Việc cần
 * làm), not a substitute for this screen.
 */
export const moreNavSections: NavigationSection[] = navigationSections
  .map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !bottomNavItems.includes(item) && item !== invoicesItem,
    ),
  }))
  .filter((section) => section.items.length > 0);
