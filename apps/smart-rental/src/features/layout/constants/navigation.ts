import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarRange,
  DoorOpen,
  Gauge,
  Home,
  ListChecks,
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
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

/**
 * The prototype's `appRouteManifest`, reduced to what the shell reads: the 15
 * areas in sidebar order, grouped as before, with the title + description the
 * header shows for the area a path falls under. Paths come from `ROUTES` — the
 * manifest never carried a route element here, `~/pages/main.tsx` does. Copy
 * and icons follow the glossary (ADR-0011, brief §4/§7).
 *
 * Every item is named so `bottomNavItems` (ADR-0011, spec #153 §10 row 22)
 * can pull four of them out by reference rather than duplicating a path
 * string, and `moreNavSections` can filter the rest out mechanically.
 */
export const dashboardItem: NavigationItem = {
  path: ROUTES.HOME,
  title: "Hôm nay",
  description: "Tổng quan hoạt động quản lý phòng trọ.",
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

const tasksItem: NavigationItem = {
  path: ROUTES.TASKS,
  title: "Việc cần làm",
  description: "Xem các việc cần xử lý.",
  icon: ListChecks,
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
 * "Kỳ điện nước & hoá đơn" (ADR-0013) — always points at the CURRENT kỳ,
 * so opening it never asks the landlord to pick a month first. Replaces the
 * old Đợt hoá đơn + Nhập chỉ số entries; `/utilities` keeps its own row as
 * read-only history.
 */
const cyclesItem: NavigationItem = {
  path: ROUTES.cycleDetailPath(dayjs().format("YYYY-MM")),
  title: "Kỳ điện nước & hoá đơn",
  description: "Chốt chỉ số điện nước và lập hoá đơn theo kỳ.",
  icon: CalendarRange,
};

const utilitiesItem: NavigationItem = {
  path: ROUTES.UTILITIES,
  title: "Chỉ số điện nước",
  description: "Quản lý chỉ số điện nước.",
  icon: Gauge,
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

export const navigationSections: NavigationSection[] = [
  {
    label: "Chính",
    items: [dashboardItem, buildingsItem, roomsItem, tenantsItem, tasksItem],
  },
  {
    label: "Quản lý",
    items: [
      contractsItem,
      cyclesItem,
      invoicesItem,
      utilitiesItem,
      supplierBillsItem,
      expensesItem,
      reconciliationItem,
      reportsItem,
    ],
  },
  {
    label: "Hệ thống",
    items: [complianceItem, communicationsItem, settingsItem],
  },
];

/** The bottom nav's four fixed stops (ADR-0011, spec #153 §10 row 22) — "Thêm" is the fifth, a Sheet over `moreNavSections`. */
export const bottomNavItems: NavigationItem[] = [
  dashboardItem,
  roomsItem,
  tenantsItem,
  invoicesItem,
];

/** Every area not already a bottom-nav stop, grouped as the sidebar groups them, empty groups dropped. */
export const moreNavSections: NavigationSection[] = navigationSections
  .map((section) => ({
    ...section,
    items: section.items.filter((item) => !bottomNavItems.includes(item)),
  }))
  .filter((section) => section.items.length > 0);
