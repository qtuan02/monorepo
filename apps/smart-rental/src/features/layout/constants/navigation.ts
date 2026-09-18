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
  path: string;
  /** The `<Link>` target when it differs from `path` — a query string over
   * the same route ("Thu tiền"). Matching (`isNavigationItemActive`, header
   * resolution) always reads `path`, never `to`. */
  to?: string;
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
  path: ROUTES.HOME,
  title: "Hôm nay",
  description: "Việc cần làm hôm nay.",
  icon: Home,
};

const buildingsItem: NavigationItem = {
  path: ROUTES.BUILDINGS,
  title: "Toà nhà",
  description: "Quản lý danh sách Toà nhà.",
  icon: Building2,
};

const roomsItem: NavigationItem = {
  path: ROUTES.ROOMS,
  title: "Phòng",
  description: "Quản lý danh sách phòng và trạng thái.",
  icon: DoorOpen,
};

const tenantsItem: NavigationItem = {
  path: ROUTES.TENANTS,
  title: "Người thuê",
  description: "Theo dõi thông tin Người thuê.",
  icon: Users,
};

const contractsItem: NavigationItem = {
  path: ROUTES.CONTRACTS,
  title: "Hợp đồng",
  description: "Quản lý hợp đồng cho thuê.",
  icon: ScrollText,
};

const invoicesItem: NavigationItem = {
  path: ROUTES.INVOICES,
  title: "Hoá đơn",
  description: "Theo dõi thanh toán và công nợ.",
  icon: ReceiptText,
};

/**
 * "Thu tiền" — bottom nav's own ô 4 (spec #179 §"IA / shell"), the same
 * `/invoices` route filtered to còn phải thu + sắp theo hạn, not a route of
 * its own. `path` stays the bare route so active-state matching still marks
 * "Hoá đơn" (the sidebar's own row) rather than nothing; `to` carries the query.
 */
const collectPaymentItem: NavigationItem = {
  path: ROUTES.INVOICES,
  to: `${ROUTES.INVOICES}?status=UNPAID,PARTIAL,OVERDUE&sort=dueDate`,
  title: "Thu tiền",
  description: "Hoá đơn còn phải thu, sắp theo hạn.",
  icon: HandCoins,
};

/**
 * "Kỳ điện nước & hoá đơn" (ADR-0013) — always points at the CURRENT kỳ,
 * so opening it never asks the landlord to pick a month first. Replaces the
 * old Đợt hoá đơn + Nhập chỉ số entries; `/utilities` stays reachable (a
 * Phòng's own Chỉ số tab, and this screen's "Xem các Kỳ trước") but is no
 * longer a sidebar row of its own.
 */
const cyclesItem: NavigationItem = {
  path: ROUTES.cycleDetailPath(dayjs().format("YYYY-MM")),
  title: "Kỳ điện nước & hoá đơn",
  description: "Chốt chỉ số điện nước và lập hoá đơn theo kỳ.",
  icon: CalendarRange,
};

const supplierBillsItem: NavigationItem = {
  path: ROUTES.SUPPLIER_BILLS,
  title: "Hoá đơn nhà cung cấp",
  description: "Quản lý hoá đơn từ nhà cung cấp dịch vụ.",
  icon: Receipt,
};

const expensesItem: NavigationItem = {
  path: ROUTES.EXPENSES,
  title: "Chi phí",
  description: "Quản lý các khoản chi phí hoạt động.",
  icon: Wallet,
};

const reconciliationItem: NavigationItem = {
  path: ROUTES.RECONCILIATION,
  title: "Đối soát",
  description: "Đối soát thu chi theo Toà nhà.",
  icon: Banknote,
};

const reportsItem: NavigationItem = {
  path: ROUTES.REPORTS,
  title: "Báo cáo",
  description: "Xem báo cáo doanh thu, chi phí và hiệu suất.",
  icon: BarChart3,
};

const complianceItem: NavigationItem = {
  path: ROUTES.COMPLIANCE,
  title: "Khai báo lưu trú",
  description: "Thông báo lưu trú và Đăng ký tạm trú của Người thuê.",
  icon: ShieldCheck,
};

const communicationsItem: NavigationItem = {
  path: ROUTES.COMMUNICATIONS,
  title: "Thông báo",
  description: "Gửi thông báo cho Người thuê.",
  icon: Bell,
};

const settingsItem: NavigationItem = {
  path: ROUTES.SETTINGS,
  title: "Cài đặt",
  description: "Cấu hình hệ thống.",
  icon: Settings,
};

/** `/utilities` (list + detail) — reachable, but no longer a sidebar row (ADR-0013). */
const utilitiesItem: NavigationItem = {
  path: ROUTES.UTILITIES,
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
 * groups them, empty groups dropped. Thông báo is left out too (spec #179
 * §"IA / shell" — its own row folds into the header's chuông on mobile).
 */
export const moreNavSections: NavigationSection[] = navigationSections
  .map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !bottomNavItems.includes(item) &&
        item !== invoicesItem &&
        item !== communicationsItem,
    ),
  }))
  .filter((section) => section.items.length > 0);
