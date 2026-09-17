/**
 * Khai báo lưu trú is two kinds, each about one Người thuê (ADR-0012, spec
 * #153 §10): Thông báo lưu trú (the landlord's own duty) and Đăng ký tạm trú
 * (the tenant's, tracked here). "safety_inspection" / "documentation" are
 * dropped — a facility's own obligations, out of this ticket's scope.
 */
export type ComplianceType = "residence_notification" | "residence_registration";

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
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  dueDate: string;
  completedDate?: string;
  /** Mã hồ sơ Cổng DVC — set once a Thông báo lưu trú has been sent. */
  referenceNumber?: string;
}
