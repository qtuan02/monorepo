import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Task } from "~/types/task";
import type { OverdueQueueGroup, TaskQueueEntry } from "~/utils/task-queue";
import { TaskQueue } from "~/components/queue/task-queue";
import { mockInvoices } from "~/constants/mock/invoices";
import { taskTypeConfig } from "~/constants/status";
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
  dueAt: new Date("2026-09-05").getTime(),
  invoices: [
    {
      invoiceId: "I071",
      invoiceNumber: "HÓA-071",
      room: "Phòng 101",
      tenant: "Nguyễn Văn A",
      outstanding: 2_700_000,
      dueDate: "05/09/2026",
    },
    {
      invoiceId: "I072",
      invoiceNumber: "HÓA-072",
      room: "Phòng 102",
      tenant: "Trần Thị B",
      outstanding: 3_100_000,
      dueDate: "05/09/2026",
    },
  ],
};

function renderQueue(entries: TaskQueueEntry[]) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <TaskQueue entries={entries} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TaskQueue", () => {
  it("gives each item's action row its own full-width, wrapping line", () => {
    renderQueue([{ kind: "task", key: task.id, task, dueAt: 0 }]);

    const actions = screen
      .getByText("Gia hạn")
      .closest("[data-slot=item-actions]");
    expect(actions).toHaveClass("w-full", "flex-wrap", "md:w-auto");
  });

  it("sizes every action sm (h-8) — round 4 dropped the default-variant primary", () => {
    renderQueue([{ kind: "task", key: task.id, task, dueAt: 0 }]);

    expect(screen.getByRole("link", { name: "Gia hạn" })).toHaveClass("h-8");
    expect(screen.getByRole("link", { name: "Thanh lý" })).toHaveClass("h-8");
  });

  // Round 4 §10 Q22: no per-row action is the navy default-variant Button —
  // "Nhắc tất cả"/"Sửa chỉ số"/etc. are outline, "Xem n hoá đơn"/"Thanh lý"
  // are ghost. The bell reads the same composite, so this covers it too.
  it("never renders a default-variant button on a queue row", () => {
    const { container } = renderQueue([
      { kind: "task", key: task.id, task, dueAt: 0 },
      overdueGroup,
    ]);

    expect(container.querySelectorAll('[data-variant="default"]')).toHaveLength(
      0,
    );
  });

  // The bell links to `taskRelatedPath(task)` too (see NotificationEntry's
  // own test) — reading the same table/function is what keeps the two in
  // sync (ticket #230).
  it("uses the shared taskTypeConfig label and taskRelatedPath's own destination", () => {
    renderQueue([{ kind: "task", key: task.id, task, dueAt: 0 }]);

    const primaryLink = screen.getByRole("link", {
      name: taskTypeConfig[task.type].actionLabel,
    });
    expect(primaryLink).toHaveAttribute("href", taskRelatedPath(task));
  });

  it("shows «Không có việc nào» once the queue is empty", () => {
    renderQueue([]);

    expect(screen.getByText("Không có việc nào.")).toBeInTheDocument();
  });

  it("gộps Hoá đơn quá hạn into one entry with the group's own total", () => {
    renderQueue([overdueGroup]);

    expect(screen.getByText(/2 Hoá đơn quá hạn/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nhắc tất cả" }),
    ).toBeInTheDocument();
    // Sub-items stay collapsed until "Xem n hoá đơn" is pressed.
    expect(screen.queryByText(/HÓA-071/)).not.toBeInTheDocument();
  });

  it("shows a single-invoice mục's Ghi nhận thu/VietQR inline — no Collapsible for one", () => {
    const [firstInvoice] = overdueGroup.invoices;
    if (!firstInvoice) throw new Error("expected a fixture invoice");
    const oneInvoiceGroup: OverdueQueueGroup = {
      ...overdueGroup,
      totalOutstanding: 2_700_000,
      invoices: [firstInvoice],
    };
    renderQueue([oneInvoiceGroup]);

    expect(screen.getByText(/HÓA-071/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ghi nhận thu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Thanh toán VietQR" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Nhắc tất cả" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Xem 1 hoá đơn/)).not.toBeInTheDocument();
  });

  it("expands to show each Hoá đơn's own Ghi nhận thu + VietQR", async () => {
    const user = userEvent.setup();
    renderQueue([overdueGroup]);

    await user.click(screen.getByRole("button", { name: /Xem 2 hoá đơn/ }));

    expect(screen.getByText(/HÓA-071/)).toBeInTheDocument();
    expect(screen.getByText(/HÓA-072/)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Ghi nhận thu" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Thanh toán VietQR" }),
    ).toHaveLength(2);
  });

  it("opens the Ghi nhận thu sheet prefilled with the Hoá đơn's own còn lại", async () => {
    const user = userEvent.setup();
    renderQueue([overdueGroup]);
    await user.click(screen.getByRole("button", { name: /Xem 2 hoá đơn/ }));

    // The first row rendered is HÓA-071 (the group sorts its own invoices by hạn).
    const [firstRow] = screen.getAllByRole("button", { name: "Ghi nhận thu" });
    if (!firstRow) throw new Error("expected a Ghi nhận thu button");
    await user.click(firstRow);

    const amountInput = await screen.findByLabelText(/Số tiền/);
    expect(amountInput).toHaveValue(2_700_000);
  });

  it("opens the Nhắc tất cả dialog scoped to every Hoá đơn of the group", async () => {
    const user = userEvent.setup();
    renderQueue([overdueGroup]);

    await user.click(screen.getByRole("button", { name: "Nhắc tất cả" }));

    expect(
      await screen.findByText("Chọn kênh gửi cho 2 hoá đơn đã chọn."),
    ).toBeInTheDocument();
  });

  // AC: "'Nhắc tất cả' ghi nhật ký cho mọi Hoá đơn của mục" — built off REAL
  // Mock invoices (not the hand-fed fixture above), so the mutation's own
  // `mockInvoices.find(...)` actually has something to write onto.
  it("«Nhắc tất cả» ghi nhật ký nhắc thật cho mọi Hoá đơn của mục", async () => {
    const user = userEvent.setup();
    const [first, second] = mockInvoices.filter(
      (invoice) => invoice.buildingId === "b1",
    );
    if (!first || !second) throw new Error("expected ≥ 2 Hoá đơn cho b1");
    const remindersBefore = {
      first: first.reminders.length,
      second: second.reminders.length,
    };

    const realGroup: OverdueQueueGroup = {
      kind: "overdue-group",
      key: "invoice_overdue-b1",
      buildingId: "b1",
      buildingName: "Trọ Sinh Viên Xanh",
      totalOutstanding: 1,
      dueAt: 0,
      invoices: [first, second].map((invoice) => ({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        room: invoice.room,
        tenant: invoice.tenant,
        outstanding: invoice.amount - invoice.paidAmount,
        dueDate: invoice.dueDate,
      })),
    };
    renderQueue([realGroup]);

    await user.click(screen.getByRole("button", { name: "Nhắc tất cả" }));
    const dialogDescription = await screen.findByText(
      "Chọn kênh gửi cho 2 hoá đơn đã chọn.",
    );
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    // The dialog closes on success (`onOpenChange(false)`) — no `Toaster`
    // is mounted in this isolated render, so that closing is the signal to
    // wait on, not the toast text.
    await waitFor(() => expect(dialogDescription).not.toBeInTheDocument());
    expect(first.reminders.length).toBe(remindersBefore.first + 1);
    expect(second.reminders.length).toBe(remindersBefore.second + 1);
  });
});
