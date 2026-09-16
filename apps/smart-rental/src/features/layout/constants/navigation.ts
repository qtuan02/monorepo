import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BarChart3,
  Building,
  Building2,
  CheckSquare,
  Droplet,
  Home,
  MessageSquare,
  ReceiptPoundSterling,
  ReceiptText,
  ScrollText,
  Settings,
  Shield,
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
 * manifest never carried a route element here, `~/pages/main.tsx` does.
 */
const dashboardItem: NavigationItem = {
  path: ROUTES.HOME,
  title: "Tổng quan",
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
        title: "Tòa nhà",
        description: "Quản lý danh sách tòa nhà.",
        icon: Building,
      },
      {
        path: ROUTES.ROOMS,
        title: "Phòng trọ",
        description: "Quản lý danh sách phòng và trạng thái.",
        icon: Building2,
      },
      {
        path: ROUTES.TENANTS,
        title: "Khách thuê",
        description: "Theo dõi thông tin khách thuê.",
        icon: Users,
      },
      {
        path: ROUTES.TASKS,
        title: "Trung tâm nhiệm vụ",
        description: "Xem các nhiệm vụ cần xử lý.",
        icon: CheckSquare,
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
        title: "Hóa đơn",
        description: "Theo dõi thanh toán và công nợ.",
        icon: ReceiptText,
      },
      {
        path: ROUTES.UTILITIES,
        title: "Tiện ích",
        description: "Quản lý chỉ số điện nước.",
        icon: Droplet,
      },
      {
        path: ROUTES.SUPPLIER_BILLS,
        title: "Hóa đơn nhà cung cấp",
        description: "Quản lý hóa đơn từ nhà cung cấp dịch vụ.",
        icon: ReceiptPoundSterling,
      },
      {
        path: ROUTES.EXPENSES,
        title: "Chi phí vận hành",
        description: "Quản lý các khoản chi phí hoạt động.",
        icon: Wallet,
      },
      {
        path: ROUTES.RECONCILIATION,
        title: "Đối soát chi phí",
        description: "Đối soát thu chi theo tòa nhà.",
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
        title: "Tuân thủ",
        description: "Quản lý khai báo nơi ở và kiểm tra an toàn.",
        icon: Shield,
      },
      {
        path: ROUTES.COMMUNICATIONS,
        title: "Liên lạc",
        description: "Gửi thông báo cho khách thuê.",
        icon: MessageSquare,
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

const navigationItems = navigationSections.flatMap((section) => section.items);

/**
 * Whether `pathname` falls under a sidebar area. `/` matches only itself;
 * every other area also owns its sub-paths (`/contracts/c-1/renew` is still
 * "Hợp đồng"), matched on a segment boundary so `/rooms-x` is not `/rooms`.
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  if (item.path === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

/** The area the header names for a path; the dashboard when none matches. */
export function resolveNavigationItem(pathname: string): NavigationItem {
  return (
    navigationItems.find((item) => isNavigationItemActive(item, pathname)) ??
    dashboardItem
  );
}
