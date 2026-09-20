import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Task } from "~/types/task";
import type { OverdueQueueGroup, TaskQueueEntry } from "~/utils/task-queue";
import { ROUTES } from "~/constants/routes";
import { taskTypeConfig } from "~/constants/status";
import { NotificationEntry } from "~/features/layout/components/header/notification-panel";
import { taskRelatedPath } from "~/utils/task-due";

const task: Task = {
  id: "task-1",
  type: "contract_expiring",
  title: "Hợp đồng HĐ-071 sắp hết hạn",
  description: "Phòng 101 · Nguyễn Văn A",
  status: "open",
  buildingId: "b1",
  relatedEntity: "contract",
  relatedId: "C071",
  dueDate: "2026-09-10",
  createdAt: "2026-09-01",
};

const overdueGroup: OverdueQueueGroup = {
  kind: "overdue-group",
  key: "invoice_overdue-b1",
  buildingId: "b1",
  buildingName: "Trọ Sinh Viên Xanh",
  totalOutstanding: 5_800_000,
  dueAt: 0,
  invoices: [],
};

function renderEntry(entry: TaskQueueEntry) {
  return render(
    <MemoryRouter>
      <NotificationEntry entry={entry} />
    </MemoryRouter>,
  );
}

describe("NotificationEntry", () => {
  // Ticket #230: clicking a Việc at the bell must land where clicking that
  // SAME Việc at Hôm nay lands — off `taskRelatedPath`, not a bell-only
  // literal. Renew, not the read-only contract detail, is what "Gia hạn"
  // (Hôm nay's own primary hành động for this Việc) points at.
  it("goes to the same destination Hôm nay's own hành động for this Việc goes to", () => {
    renderEntry({ kind: "task", key: task.id, task, dueAt: 0 });

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", taskRelatedPath(task));
    expect(taskRelatedPath(task)).toBe(ROUTES.contractRenewPath("C071"));
  });

  it("reads its action's destination from the shared taskTypeConfig table, not a literal", () => {
    // Every TaskType the bell can render has an actionLabel in the same
    // table `TaskQueue` reads — nothing bell-only left to drift.
    expect(taskTypeConfig[task.type].actionLabel).toBe("Gia hạn");
  });

  it("links a Hoá đơn quá hạn mục to the filtered Danh sách hoá đơn, not one invoice", () => {
    renderEntry(overdueGroup);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      ROUTES.overdueInvoicesPath(),
    );
  });
});
