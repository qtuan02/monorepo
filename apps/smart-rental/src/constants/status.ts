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
import type {
  ComplianceStatus,
  ComplianceType,
  ResidenceNotificationStatus,
} from "~/types/compliance";
import type { ContractStatus, DepositStatus } from "~/types/contract";
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
import type {
  MeterEntryStatus,
  UtilityStatus,
  UtilityType,
} from "~/types/utility";

/**
 * The one home for every status/display config (spec #127 folded the
 * prototype's eight files here). A tone is a bg/text/border trio on the
 * theme's status tokens (ADR-0011) — light only, this app has no dark mode —
 * and a config is what `StatusBadge` and a faceted filter both read.
 */
export const statusTone = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
  muted: "bg-muted text-muted-foreground border-border",
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
  DRAFT: { label: "Nháp", className: statusTone.neutral, icon: Clock },
  UNPAID: { label: "Chưa thu", className: statusTone.info, icon: Clock },
  PARTIAL: {
    label: "Thu một phần",
    className: statusTone.warning,
    icon: AlertCircle,
  },
  PAID: {
    label: "Đã thu",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  OVERDUE: { label: "Quá hạn", className: statusTone.error, icon: AlertCircle },
  CANCELLED: { label: "Đã huỷ", className: statusTone.muted, icon: Ban },
};

export const utilityStatusConfig: Record<UtilityStatus, StatusConfig> = {
  DRAFT: { label: "Nháp", className: statusTone.neutral, icon: Clock },
  VERIFIED: {
    label: "Đã xác minh",
    className: statusTone.success,
    icon: CheckCircle2,
  },
};

/** "Nhập chỉ số"'s own live badge — never a persisted `UtilityStatus`. */
export const meterEntryStatusConfig: Record<MeterEntryStatus, StatusConfig> = {
  draft: { label: "Nháp", className: statusTone.neutral, icon: Clock },
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
    className: "bg-warning/10 text-warning border-warning/20",
    icon: Zap,
  },
  water: {
    label: "Nước",
    className: "bg-info/10 text-info border-info/20",
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
  invoice_overdue: { label: "Hoá đơn quá hạn", className: statusTone.info },
  contract_expiring: {
    label: "Hợp đồng sắp hết hạn",
    className: statusTone.info,
  },
  maintenance: { label: "Bảo trì", className: statusTone.info },
  utility_anomaly: { label: "Chỉ số bất thường", className: statusTone.info },
  residence_notification: {
    label: "Thiếu Thông báo lưu trú",
    className: statusTone.info,
  },
  batch_pending: { label: "Chưa lập Đợt hoá đơn", className: statusTone.info },
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
  residence_notification: { label: "Thông báo lưu trú" },
  residence_registration: { label: "Đăng ký tạm trú" },
};

/** Thông báo lưu trú's own two states (ticket #161) — no "quá hạn", just sent or not yet. */
export const residenceNotificationStatusConfig: Record<
  ResidenceNotificationStatus,
  StatusConfig
> = {
  sent: { label: "Đã gửi", className: statusTone.success, icon: CheckCircle2 },
  not_sent: { label: "Chưa gửi", className: statusTone.warning, icon: Clock },
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
    className: "bg-info/10 text-info",
    icon: MessageSquare,
  },
  email: {
    label: "Email",
    className: "bg-primary/10 text-primary",
    icon: Mail,
  },
  zalo: { label: "Zalo", className: "bg-success/10 text-success", icon: Send },
  in_app: {
    label: "Trong ứng dụng",
    className: "bg-muted text-muted-foreground",
    icon: Bell,
  },
};

export const tenantStatusConfig: Record<TenantStatus, StatusConfig> = {
  active: { label: "Đang thuê", className: statusTone.success },
  ended: { label: "Đã rời", className: statusTone.neutral },
};

/** The "cờ có Hoá đơn quá hạn" badge (ADR-0012) — not a `TenantStatus`, so it lives next to it rather than in the record. */
export const tenantOverdueInvoiceConfig: StatusConfig = {
  label: "Có hoá đơn quá hạn",
  className: statusTone.error,
  icon: AlertCircle,
};

export const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
  DRAFT: { label: "Nháp", className: statusTone.neutral, icon: Clock },
  ACTIVE: {
    label: "Đang hiệu lực",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  EXPIRING: {
    label: "Sắp hết hạn",
    className: statusTone.warning,
    icon: AlertCircle,
  },
  EXPIRED: {
    label: "Đã hết hạn",
    className: statusTone.neutral,
    icon: XCircle,
  },
  TERMINATED: {
    label: "Đã thanh lý",
    className: statusTone.muted,
    icon: XCircle,
  },
};

export const depositStatusConfig: Record<DepositStatus, StatusConfig> = {
  HELD: { label: "Đang giữ", className: statusTone.info, icon: Clock },
  RETURNED: {
    label: "Đã hoàn",
    className: statusTone.success,
    icon: CheckCircle2,
  },
  PARTIAL_RETURNED: {
    label: "Hoàn một phần",
    className: statusTone.warning,
    icon: AlertCircle,
  },
  FORFEITED: { label: "Không hoàn", className: statusTone.error, icon: Ban },
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
