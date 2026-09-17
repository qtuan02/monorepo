/**
 * The prototype's `Task`, kept 1:1 plus the three sources ADR-0012 added:
 * `utility_anomaly`, `residence_notification` (its name matches
 * `ComplianceType`'s own value on purpose) and `batch_pending`. Every value
 * is now derived from five sources (`~/utils/task-derivation`), never
 * authored by hand.
 */
export type TaskType =
  | "invoice_overdue"
  | "contract_expiring"
  | "maintenance"
  | "utility_anomaly"
  | "residence_notification"
  | "batch_pending";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "open" | "in_progress" | "done";
export type TaskRelatedEntity =
  | "invoice"
  | "contract"
  | "room"
  | "tenant"
  | "utility"
  | "building";

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** Which entity `relatedId` names — the one screen a task links to. */
  relatedEntity: TaskRelatedEntity;
  relatedId: string;
  /** ISO date (`YYYY-MM-DD`). */
  dueDate: string;
  createdAt: string;
}

export interface TaskListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}
