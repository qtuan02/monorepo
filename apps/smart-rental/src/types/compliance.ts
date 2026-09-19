/**
 * Khai báo lưu trú is two kinds, each about one Người thuê (ADR-0012, spec
 * #153 §10): Thông báo lưu trú (the landlord's own duty) and Đăng ký tạm trú
 * (the tenant's, tracked here). "safety_inspection" / "documentation" are
 * dropped — a facility's own obligations, out of this ticket's scope.
 */
export type ComplianceType =
  | "residence_notification"
  | "residence_registration";

export type ComplianceStatus = "completed" | "pending" | "overdue";

/**
 * The prototype's `ComplianceItem`, extended with `tenantId` (ADR-0012) —
 * `tenant` / `room` stay denormalized so the existing screens read unchanged.
 */
export interface ComplianceItem {
  id: string;
  buildingId: string;
  tenantId: string;
  tenant: string;
  room: string;
  type: ComplianceType;
  status: ComplianceStatus;
  /** ISO `YYYY-MM-DD`. */
  dueDate: string;
  completedDate?: string;
  /** Mã hồ sơ Cổng DVC — set once a Thông báo lưu trú has been sent. */
  referenceNumber?: string;
}

export interface ComplianceListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

/** Thông báo lưu trú has no "quá hạn" of its own (ticket #161) — only sent or not yet. */
export type ResidenceNotificationStatus = "sent" | "not_sent";

/**
 * One Người thuê's "hai dòng" (spec #153 §10 row 8, ticket #161) — computed at
 * read time from `~/utils/residence-declaration`, never a stored row. Only a
 * tenant with a live Hợp đồng gets one at all.
 */
export interface ResidenceDeclaration {
  tenantId: string;
  tenantName: string;
  buildingId: string;
  room: string;
  notificationStatus: ResidenceNotificationStatus;
  notificationDate?: string;
  referenceNumber?: string;
  /**
   * Derived purely from `registrationDueDate` (ticket #188) — "overdue" once
   * past it, "pending" otherwise. Never read off a stored `ComplianceItem.status`.
   */
  registrationStatus: ComplianceStatus;
  /** ISO `YYYY-MM-DD`. */
  registrationDueDate: string;
  registrationExpiringSoon: boolean;
}
