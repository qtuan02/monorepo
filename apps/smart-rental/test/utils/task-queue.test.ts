import { describe, expect, it } from "vitest";

import type { Building } from "~/types/building";
import type { Invoice } from "~/types/invoice";
import type { Task } from "~/types/task";
import { buildTaskQueueEntries } from "~/utils/task-queue";

const buildings: Building[] = [
  {
    id: "b1",
    name: "Trọ Sinh Viên Xanh",
    address: "",
    collectionDay: 5,
    priceList: { electricityPricePerKwh: 0, waterPricePerM3: 0, serviceFee: 0 },
  },
  {
    id: "b2",
    name: "Nhà trọ An Bình",
    address: "",
    collectionDay: 5,
    priceList: { electricityPricePerKwh: 0, waterPricePerM3: 0, serviceFee: 0 },
  },
];

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "I001",
    buildingId: "b1",
    contractId: "C001",
    invoiceNumber: "HÓA-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    amount: 3_000_000,
    lineItems: [],
    payments: [],
    paidAmount: 0,
    reminders: [],
    billingMonth: "2026-08",
    month: "08/2026",
    dueDate: "05/09/2026",
    status: "OVERDUE",
    paymentDate: null,
    lastUpdated: "18/09/2026",
    ...overrides,
  };
}

function overdueTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "invoice_overdue-I001",
    type: "invoice_overdue",
    title: "Hoá đơn HÓA-001 quá hạn",
    description: "",
    status: "open",
    buildingId: "b1",
    relatedEntity: "invoice",
    relatedId: "I001",
    dueDate: "2026-09-05",
    createdAt: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

function contractTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "contract_expiring-C001",
    type: "contract_expiring",
    title: "Hợp đồng HĐ-001 sắp hết hạn",
    description: "",
    status: "open",
    buildingId: "b1",
    relatedEntity: "contract",
    relatedId: "C001",
    dueDate: "2026-09-30",
    createdAt: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildTaskQueueEntries", () => {
  it("groups every invoice_overdue task of the same Toà nhà into one entry", () => {
    const entries = buildTaskQueueEntries(
      [
        overdueTask({ id: "t1", relatedId: "I001" }),
        overdueTask({ id: "t2", relatedId: "I002" }),
      ],
      [
        invoice({ id: "I001", dueDate: "05/09/2026", amount: 3_000_000 }),
        invoice({ id: "I002", dueDate: "05/09/2026", amount: 2_000_000 }),
      ],
      buildings,
    );

    expect(entries).toHaveLength(1);
    const group = entries[0];
    if (group?.kind !== "overdue-group") throw new Error("expected a group");
    expect(group.invoices).toHaveLength(2);
    expect(group.totalOutstanding).toBe(5_000_000);
    expect(group.buildingName).toBe("Trọ Sinh Viên Xanh");
  });

  it("keeps two Toà nhà's Hoá đơn quá hạn as two separate groups", () => {
    const entries = buildTaskQueueEntries(
      [
        overdueTask({ id: "t1", relatedId: "I001", buildingId: "b1" }),
        overdueTask({ id: "t2", relatedId: "I002", buildingId: "b2" }),
      ],
      [
        invoice({ id: "I001", buildingId: "b1" }),
        invoice({ id: "I002", buildingId: "b2" }),
      ],
      buildings,
    );

    const groups = entries.filter((entry) => entry.kind === "overdue-group");
    expect(groups).toHaveLength(2);
  });

  it("leaves every other task type as its own single entry", () => {
    const entries = buildTaskQueueEntries([contractTask()], [], buildings);

    expect(entries).toEqual([
      expect.objectContaining({ kind: "task", key: "contract_expiring-C001" }),
    ]);
  });

  it("sorts entries by hạn ascending, urgent first regardless of loại", () => {
    const entries = buildTaskQueueEntries(
      [
        overdueTask({ id: "t1", relatedId: "I001" }),
        contractTask({ dueDate: "2026-09-01" }),
      ],
      [invoice({ id: "I001", dueDate: "10/09/2026" })],
      buildings,
    );

    // The Hoá đơn's hạn (10/09) is later than the Hợp đồng's (01/09) — the
    // Hợp đồng entry sorts first.
    expect(entries[0]?.kind).toBe("task");
    expect(entries[1]?.kind).toBe("overdue-group");
  });

  it("anchors a group's hạn to its soonest (most overdue) Hoá đơn", () => {
    const entries = buildTaskQueueEntries(
      [
        overdueTask({ id: "t1", relatedId: "I001" }),
        overdueTask({ id: "t2", relatedId: "I002" }),
        contractTask({ dueDate: "2026-09-08" }),
      ],
      [
        invoice({ id: "I001", dueDate: "15/09/2026" }),
        invoice({ id: "I002", dueDate: "05/09/2026" }),
      ],
      buildings,
    );

    // The group's earliest invoice (05/09) sorts before the contract task
    // (08/09), even though the group's OTHER invoice (15/09) would not.
    expect(entries[0]?.kind).toBe("overdue-group");
  });
});
