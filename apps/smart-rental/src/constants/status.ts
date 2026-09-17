import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Circle,
  Clock,
  Droplets,
  Wrench,
  Zap,
} from "lucide-react";

import type { InvoiceStatus } from "~/types/invoice";
import type { RoomStatus, RoomType } from "~/types/room";
import type { UtilityStatus, UtilityType } from "~/types/utility";

/**
 * The one home for every status/display config (spec #127 folded the
 * prototype's eight files here). A tone is a bg/text/border trio on the
 * Tailwind palette — light only, this app has no dark mode — and a config is
 * what `StatusBadge` and a faceted filter both read.
 */
export const statusTone = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-300",
  error: "bg-red-50 text-red-700 border-red-300",
  info: "bg-blue-50 text-blue-700 border-blue-300",
  neutral: "bg-zinc-50 text-zinc-500 border-zinc-200",
  muted: "bg-slate-50 text-slate-700 border-slate-300",
  primary: "bg-primary/10 text-primary border-primary/20",
} as const;

export interface StatusConfig {
  label: string;
  /** The tone; absent for a config that only names things (a type, not a state). */
  className?: string;
  icon?: LucideIcon;
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: LucideIcon;
}

export const roomStatusConfig: Record<RoomStatus, StatusConfig> = {
  available: { label: "Trống", className: statusTone.success, icon: Circle },
  occupied: {
    label: "Đã thuê",
    className: statusTone.primary,
    icon: CheckCircle2,
  },
  maintenance: {
    label: "Bảo trì",
    className: statusTone.warning,
    icon: Wrench,
  },
  reserved: { label: "Đã đặt", className: statusTone.info, icon: Clock },
};

export const roomTypeConfig: Record<RoomType, StatusConfig> = {
  single: { label: "Phòng đơn" },
  double: { label: "Phòng đôi" },
  studio: { label: "Studio" },
  suite: { label: "Suite" },
};

export const invoiceStatusConfig: Record<InvoiceStatus, StatusConfig> = {
  paid: {
    label: "Đã thanh toán",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  pending: { label: "Chờ thanh toán", className: statusTone.info, icon: Clock },
  overdue: { label: "Quá hạn", className: statusTone.error, icon: AlertCircle },
  cancelled: { label: "Đã hủy", className: statusTone.muted, icon: Ban },
};

export const utilityStatusConfig: Record<UtilityStatus, StatusConfig> = {
  draft: { label: "Nháp", className: statusTone.neutral, icon: Clock },
  verified: {
    label: "Đã xác minh",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  anomaly: {
    label: "Bất thường",
    className: statusTone.error,
    icon: AlertCircle,
  },
};

/** Điện is amber, Nước is blue — the prototype's `utilityTypeColors`, light half. */
export const utilityTypeConfig: Record<UtilityType, StatusConfig> = {
  electricity: {
    label: "Điện",
    className: "bg-amber-100 text-amber-600 border-amber-200",
    icon: Zap,
  },
  water: {
    label: "Nước",
    className: "bg-blue-100 text-blue-600 border-blue-200",
    icon: Droplets,
  },
};

/** A config read as the option list of a faceted filter, in the config's order. */
export function toFilterOptions(
  config: Record<string, StatusConfig>,
): FilterOption[] {
  return Object.entries(config).map(([value, { label, icon }]) => ({
    value,
    label,
    icon,
  }));
}
