/** The prototype's `ComplianceItem` (Khai báo lưu trú), shape kept 1:1. */
export type ComplianceType =
  | "residence_declaration"
  | "safety_inspection"
  | "documentation";

export type ComplianceStatus = "completed" | "pending" | "overdue";

export interface ComplianceItem {
  id: string;
  tenant: string;
  room: string;
  type: ComplianceType;
  status: ComplianceStatus;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  dueDate: string;
  completedDate?: string;
}
