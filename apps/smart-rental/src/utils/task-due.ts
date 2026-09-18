import dayjs from "@monorepo/dayjs";

import type { Task } from "~/types/task";
import { ROUTES } from "~/constants/routes";

/** The one screen a task points at — the builder in `ROUTES` for its related entity. */
export function taskRelatedPath(task: Task): string {
  switch (task.relatedEntity) {
    case "invoice":
      return ROUTES.invoiceDetailPath(task.relatedId);
    case "contract":
      return ROUTES.contractDetailPath(task.relatedId);
    case "room":
      return ROUTES.roomDetailPath(task.relatedId);
    // Both "tenant" task sources (residence_notification,
    // residence_registration_expiring) are Khai báo lưu trú (ticket #188) —
    // land straight on the Lưu trú tab instead of the tenant's Tổng quan.
    case "tenant":
      return `${ROUTES.tenantDetailPath(task.relatedId)}?tab=residence`;
    case "cycle":
      // `relatedId` is the Kỳ's own `YYYY-MM` for this entity (see
      // `~/utils/task-derivation`'s utility_anomaly source).
      return ROUTES.cycleDetailPath(task.relatedId);
    case "building":
      return ROUTES.buildingDetailPath(task.relatedId);
  }
}

/** "Còn 5 ngày" / "Hôm nay" / "Quá hạn 3 ngày", in whole days from `now`. */
export function formatDueLabel(
  dueDate: string,
  now: Date,
): { text: string; isOverdue: boolean } {
  const days = dayjs(dueDate)
    .startOf("day")
    .diff(dayjs(now).startOf("day"), "day");

  if (days < 0) return { text: `Quá hạn ${-days} ngày`, isOverdue: true };
  if (days === 0) return { text: "Hôm nay", isOverdue: false };
  return { text: `Còn ${days} ngày`, isOverdue: false };
}
