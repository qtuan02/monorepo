import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Wrench,
  XCircle,
} from "lucide-react";

import type { ContractStatus } from "~/types/contract";
import type { RoomStatus, RoomType } from "~/types/room";
import type { TenantStatus } from "~/types/tenant";

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

export const tenantStatusConfig: Record<TenantStatus, StatusConfig> = {
  active: { label: "Đang thuê", className: statusTone.success },
  pending: { label: "Chờ vào", className: statusTone.info },
  overdue: { label: "Nợ cước", className: statusTone.error },
  ended: { label: "Đã trả", className: statusTone.neutral },
};

export const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
  active: {
    label: "Đang hoạt động",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  ending: {
    label: "Sắp hết hạn",
    className: statusTone.warning,
    icon: AlertCircle,
  },
  ended: { label: "Đã hết hạn", className: statusTone.neutral, icon: XCircle },
  pending: { label: "Chờ xử lý", className: statusTone.info, icon: Clock },
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
