import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Ban,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  Droplets,
  Mail,
  MessageSquare,
  Send,
  TrendingDown,
  TrendingUp,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

import type {
  CommunicationChannel,
  SendLogStatus,
} from "~/types/communication";
import type { ComplianceStatus, ComplianceType } from "~/types/compliance";
import type { ContractStatus } from "~/types/contract";
import type { DashboardTaskPriority } from "~/types/dashboard";
import type { InvoiceStatus } from "~/types/invoice";
import type { ReconciliationStatus } from "~/types/reconciliation";
import type { OccupancyBucket } from "~/types/report";
import type { RoomStatus, RoomType } from "~/types/room";
import type {
  SupplierBillPaymentStatus,
  SupplierBillType,
} from "~/types/supplier-bill";
import type { TaskPriority, TaskStatus, TaskType } from "~/types/task";
import type { TenantStatus } from "~/types/tenant";
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
/**
 * The distinct values of a free-text column as a facet's options — for a
 * column with no fixed vocabulary (an expense category, a billing period).
 */
export function toDistinctOptions(values: string[]): FilterOption[] {
  return [...new Set(values)].map((value) => ({ value, label: value }));
}

export const taskStatusConfig: Record<TaskStatus, StatusConfig> = {
  open: { label: "Mở", className: statusTone.info },
  in_progress: { label: "Đang xử lý", className: statusTone.warning },
  done: { label: "Hoàn thành", className: statusTone.success },
};

export const taskPriorityConfig: Record<TaskPriority, StatusConfig> = {
  high: { label: "Cao", className: statusTone.error },
  medium: { label: "Trung bình", className: statusTone.warning },
  low: { label: "Thấp", className: statusTone.neutral },
};

export const taskTypeConfig: Record<TaskType, StatusConfig> = {
  invoice_overdue: { label: "Hóa đơn quá hạn", className: statusTone.info },
  contract_expiring: {
    label: "Hợp đồng sắp hết hạn",
    className: statusTone.info,
  },
  maintenance: { label: "Bảo trì", className: statusTone.info },
};

export const complianceStatusConfig: Record<ComplianceStatus, StatusConfig> = {
  completed: {
    label: "Hoàn thành",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  pending: { label: "Chờ xử lý", className: statusTone.info, icon: Clock },
  overdue: { label: "Quá hạn", className: statusTone.error, icon: AlertCircle },
};

export const complianceTypeConfig: Record<ComplianceType, StatusConfig> = {
  residence_declaration: { label: "Khai báo nơi ở" },
  safety_inspection: { label: "Kiểm tra an toàn" },
  documentation: { label: "Tài liệu" },
};

export const sendLogStatusConfig: Record<SendLogStatus, StatusConfig> = {
  sent: { label: "Đã gửi", className: statusTone.success, icon: CheckCircle2 },
  pending: { label: "Chờ gửi", className: statusTone.warning, icon: Clock },
  failed: { label: "Thất bại", className: statusTone.error, icon: XCircle },
};

export const occupancyBucketConfig: Record<OccupancyBucket, StatusConfig> = {
  good: { label: "Tốt", className: statusTone.success },
  warning: { label: "Cảnh báo", className: statusTone.warning },
  critical: { label: "Nguy hiểm", className: statusTone.error },
};

/** The tone here colours a channel's icon tile, not a badge. */
export const channelConfig: Record<CommunicationChannel, StatusConfig> = {
  sms: {
    label: "SMS",
    className: "bg-blue-100 text-blue-600",
    icon: MessageSquare,
  },
  email: {
    label: "Email",
    className: "bg-purple-100 text-purple-600",
    icon: Mail,
  },
  zalo: { label: "Zalo", className: "bg-cyan-100 text-cyan-600", icon: Send },
  in_app: {
    label: "Trong ứng dụng",
    className: "bg-zinc-100 text-zinc-600",
    icon: Bell,
  },
};

export const dashboardTaskPriorityConfig: Record<
  DashboardTaskPriority,
  StatusConfig
> = {
  urgent: { label: "Khẩn cấp", className: statusTone.error },
  high: { label: "Cao", className: statusTone.primary },
  medium: { label: "Vừa", className: statusTone.neutral },
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

export const supplierBillTypeConfig: Record<SupplierBillType, StatusConfig> = {
  electricity: { label: "Điện" },
  water: { label: "Nước" },
  trash: { label: "Rác" },
  internet: { label: "Internet" },
  other: { label: "Khác" },
};

/** Derived, not stored: a Hoá đơn nhà cung cấp with a `paymentDate` is paid. */
export const supplierBillPaymentConfig: Record<
  SupplierBillPaymentStatus,
  StatusConfig
> = {
  paid: {
    label: "Đã thanh toán",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  pending: {
    label: "Chờ thanh toán",
    className: statusTone.warning,
    icon: Clock,
  },
};

export const reconciliationStatusConfig: Record<
  ReconciliationStatus,
  StatusConfig
> = {
  gain: { label: "Lãi", className: statusTone.success, icon: TrendingUp },
  loss: { label: "Lỗ", className: statusTone.error, icon: TrendingDown },
};
