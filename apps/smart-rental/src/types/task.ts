/** The prototype's `Task`, shape kept 1:1 until `be-motel` has a contract. */
export type TaskType = "invoice_overdue" | "contract_expiring" | "maintenance";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "open" | "in_progress" | "done";
export type TaskRelatedEntity = "invoice" | "contract" | "room" | "tenant";

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
