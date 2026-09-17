import type { LucideIcon } from "lucide-react";
import { Bell, Building2, CreditCard, DollarSign } from "lucide-react";

import type { SettingCategory } from "~/types/setting";

/** The four groups of Cài đặt, in the order the screen lists them. */
export const settingCategoryConfig: Record<
  SettingCategory,
  { label: string; icon: LucideIcon; description: string }
> = {
  building: {
    label: "Thông tin toà nhà",
    icon: Building2,
    description: "Quản lý thông tin cơ bản về toà nhà",
  },
  rent: {
    label: "Cấu hình tiền thuê",
    icon: DollarSign,
    description: "Cài đặt các tham số liên quan đến tiền thuê",
  },
  notification: {
    label: "Thông báo",
    icon: Bell,
    description: "Cấu hình hệ thống thông báo",
  },
  billing: {
    label: "Hoá đơn & Thanh toán",
    icon: CreditCard,
    description: "Cài đặt hoá đơn và thanh toán",
  },
};

export const settingCategoryOrder = Object.keys(
  settingCategoryConfig,
) as SettingCategory[];
