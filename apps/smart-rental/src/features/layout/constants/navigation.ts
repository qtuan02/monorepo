import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
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
 */
/** The area the header falls back to when no path matches. */
export const dashboardItem: NavigationItem = {
  path: ROUTES.HOME,
  title: "Hôm nay",
  description: "Tổng quan hoạt động quản lý phòng trọ.",
  icon: Home,
};

export const navigationSections: NavigationSection[] = [
  {
    label: "Chính",
    items: [
      dashboardItem,
      {
        path: ROUTES.BUILDINGS,
        title: "Toà nhà",
        description: "Quản lý danh sách Toà nhà.",
        icon: Building2,
      },
      {
        path: ROUTES.ROOMS,
        title: "Phòng",
        description: "Quản lý danh sách phòng và trạng thái.",
        icon: DoorOpen,
      },
      {
        path: ROUTES.TENANTS,
        title: "Người thuê",
        description: "Theo dõi thông tin Người thuê.",
        icon: Users,
      },
      {
        path: ROUTES.TASKS,
        title: "Việc cần làm",
        description: "Xem các việc cần xử lý.",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      {
        path: ROUTES.CONTRACTS,
        title: "Hợp đồng",
        description: "Quản lý hợp đồng cho thuê.",
        icon: ScrollText,
      },
      {
        path: ROUTES.INVOICES,
        title: "Hoá đơn",
        description: "Theo dõi thanh toán và công nợ.",
        icon: ReceiptText,
      },
      {
        path: ROUTES.UTILITIES,
        title: "Chỉ số điện nước",
        description: "Quản lý chỉ số điện nước.",
        icon: Gauge,
      },
      {
        path: ROUTES.SUPPLIER_BILLS,
        title: "Hoá đơn nhà cung cấp",
        description: "Quản lý hoá đơn từ nhà cung cấp dịch vụ.",
        icon: Receipt,
      },
      {
        path: ROUTES.EXPENSES,
        title: "Chi phí",
        description: "Quản lý các khoản chi phí hoạt động.",
        icon: Wallet,
      },
      {
        path: ROUTES.RECONCILIATION,
        title: "Đối soát",
        description: "Đối soát thu chi theo Toà nhà.",
        icon: Banknote,
      },
      {
        path: ROUTES.REPORTS,
        title: "Báo cáo",
        description: "Xem báo cáo doanh thu, chi phí và hiệu suất.",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        path: ROUTES.COMPLIANCE,
        title: "Khai báo lưu trú",
        description: "Quản lý khai báo nơi ở và kiểm tra an toàn.",
        icon: ShieldCheck,
      },
      {
        path: ROUTES.COMMUNICATIONS,
        title: "Thông báo",
        description: "Gửi thông báo cho Người thuê.",
        icon: Bell,
      },
      {
        path: ROUTES.SETTINGS,
        title: "Cài đặt",
        description: "Cấu hình hệ thống.",
        icon: Settings,
      },
    ],
  },
];
