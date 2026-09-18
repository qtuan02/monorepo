import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Building } from "~/types/building";
import type { Invoice } from "~/types/invoice";
import type { Task } from "~/types/task";

export interface OverdueQueueInvoice {
  invoiceId: string;
  invoiceNumber: string;
  room: string;
  tenant: string;
  /** `amount - paidAmount`. */
  outstanding: number;
  /** Display-formatted (`DD/MM/YYYY`), as `Invoice.dueDate` already is. */
  dueDate: string;
}

/** The Hoá đơn quá hạn của một Toà nhà, gộp thành một mục (spec #179 §"Hôm nay"). */
export interface OverdueQueueGroup {
  kind: "overdue-group";
  key: string;
  buildingId: string;
  buildingName: string;
  totalOutstanding: number;
  /** Soonest (most overdue) first. */
  invoices: OverdueQueueInvoice[];
  /** The earliest invoice's due date — the group's own sort anchor. */
  dueAt: number;
}

/** Every other Việc — still one mục/one hành động, unchanged from the source Task. */
export interface TaskQueueSingle {
  kind: "task";
  key: string;
  task: Task;
  dueAt: number;
}

export type TaskQueueEntry = OverdueQueueGroup | TaskQueueSingle;

function invoiceDueAt(dueDate: string): number {
  return dayjs(dueDate, DATE_FORMAT).valueOf();
}

/** `Task.dueDate` is ISO (`YYYY-MM-DD`) — dayjs parses it with no format hint. */
function taskDueAt(dueDate: string): number {
  return dayjs(dueDate).valueOf();
}

/**
 * Hôm nay's queue (spec #179 §"Hôm nay", user stories 19–22): every
 * `invoice_overdue` Việc for the same Toà nhà collapses into one
 * `OverdueQueueGroup` (tổng còn lại, danh sách con); every other Việc stays
 * its own entry. The whole thing sorts by hạn ascending — "việc gấp nhất
 * lên đầu bất kể loại" — with the group's own hạn anchored to its soonest
 * (most overdue) Hoá đơn.
 */
export function buildTaskQueueEntries(
  tasks: Task[],
  invoices: Pick<
    Invoice,
    | "id"
    | "buildingId"
    | "invoiceNumber"
    | "room"
    | "tenant"
    | "amount"
    | "paidAmount"
    | "dueDate"
  >[],
  buildings: Pick<Building, "id" | "name">[],
): TaskQueueEntry[] {
  const overdueInvoiceIds = new Set(
    tasks
      .filter((task) => task.type === "invoice_overdue")
      .map((task) => task.relatedId),
  );

  const groupsByBuilding = new Map<string, OverdueQueueGroup>();
  for (const invoice of invoices) {
    if (!overdueInvoiceIds.has(invoice.id)) continue;
    const buildingId = invoice.buildingId ?? "";
    const dueAt = invoiceDueAt(invoice.dueDate);
    let group = groupsByBuilding.get(buildingId);
    if (!group) {
      group = {
        kind: "overdue-group",
        key: `invoice_overdue-${buildingId}`,
        buildingId,
        buildingName:
          buildings.find((building) => building.id === buildingId)?.name ?? "",
        totalOutstanding: 0,
        invoices: [],
        dueAt,
      };
      groupsByBuilding.set(buildingId, group);
    }
    group.totalOutstanding += invoice.amount - invoice.paidAmount;
    group.invoices.push({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      room: invoice.room,
      tenant: invoice.tenant,
      outstanding: invoice.amount - invoice.paidAmount,
      dueDate: invoice.dueDate,
    });
    group.dueAt = Math.min(group.dueAt, dueAt);
  }

  for (const group of groupsByBuilding.values()) {
    group.invoices.sort(
      (a, b) => invoiceDueAt(a.dueDate) - invoiceDueAt(b.dueDate),
    );
  }

  const entries: TaskQueueEntry[] = [
    ...groupsByBuilding.values(),
    ...tasks
      .filter((task) => task.type !== "invoice_overdue")
      .map(
        (task): TaskQueueSingle => ({
          kind: "task",
          key: task.id,
          task,
          dueAt: taskDueAt(task.dueDate),
        }),
      ),
  ];

  return entries.sort((a, b) => a.dueAt - b.dueAt);
}
