/**
 * The prototype's `Task`, kept 1:1 plus the four sources ADR-0012 and ticket
 * #188 added: `utility_anomaly`, `residence_notification` (its name matches
 * `ComplianceType`'s own value on purpose), `batch_pending` and
 * `residence_registration_expiring`. Every value is now derived from six
 * sources (`~/utils/task-derivation`), never authored by hand.
 */
export type TaskType =
  | "invoice_overdue"
  | "contract_expiring"
  | "maintenance"
  | "utility_anomaly"
  | "residence_notification"
  | "residence_registration_expiring"
  | "batch_pending";
export type TaskStatus = "open" | "in_progress" | "done";
/**
 * `"cycle"` (not `"utility"`) is what an `utility_anomaly` task points at
 * (spec #179 §"Hôm nay") — the màn Kỳ row where a bất thường is actually
 * duyệt-able, not the read-only `/utilities/:id` detail.
 */
export type TaskRelatedEntity =
  | "invoice"
  | "contract"
  | "room"
  | "tenant"
  | "cycle"
  | "building";

/**
 * No `priority` any more (spec #179 §"Hôm nay" decision 4 — "bỏ badge ưu
 * tiên"): the queue sorts by `dueDate`, not by a priority tier, so the field
 * carried no reader-visible meaning left to show.
 */
export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  /** The Toà nhà this Việc belongs to — what the queue groups Hoá đơn quá hạn by. */
  buildingId: string;
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
