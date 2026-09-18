import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Task } from "~/types/task";
import { TaskQueue } from "~/components/queue/task-queue";

const task: Task = {
  id: "task-1",
  type: "invoice_overdue",
  title: "Hoá đơn HÓA-071 quá hạn",
  description: "Phòng 101 · Nguyễn Văn A",
  priority: "high",
  status: "open",
  relatedEntity: "invoice",
  relatedId: "I071",
  dueDate: "2026-09-10",
  createdAt: "2026-09-01",
};

function renderQueue(tasks: Task[]) {
  return render(
    <MemoryRouter>
      <TaskQueue tasks={tasks} />
    </MemoryRouter>,
  );
}

describe("TaskQueue", () => {
  it("gives each item's action row its own full-width, wrapping line — squeezed beside the content it truncated 'Xem' to 'Xe'", () => {
    renderQueue([task]);

    const actions = screen.getByText("Xem").closest("[data-slot=item-actions]");
    expect(actions).toHaveClass("w-full", "flex-wrap", "md:w-auto");
  });

  it("sizes every action ≥ 36px tall (h-9), not the old h-8 'sm'", () => {
    renderQueue([task]);

    expect(screen.getByRole("button", { name: "Gửi nhắc" })).toHaveClass("h-9");
    expect(screen.getByRole("link", { name: "Xem" })).toHaveClass("h-9");
  });
});
