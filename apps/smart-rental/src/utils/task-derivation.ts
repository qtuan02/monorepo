import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Building } from "~/types/building";
import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Task } from "~/types/task";
import type { Tenant } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import { deriveContractStatus, isContractLive } from "~/utils/contract-status";
import { deriveInvoiceStatus } from "~/utils/invoice-status";
import { findAnomalousUtilities } from "~/utils/utility-anomaly";

function toIsoDate(value: string): string {
  // `value` is the app's day-first display format; Task.dueDate is ISO
  // (YYYY-MM-DD) so it sorts and compares like any other ISO date.
  return dayjs(value, DATE_FORMAT).format("YYYY-MM-DD");
}

interface TaskDerivationSources {
  contracts: Contract[];
  invoices: Invoice[];
  utilities: Utility[];
  tenants: Tenant[];
  complianceItems: ComplianceItem[];
  buildings: Building[];
}

/**
 * Việc cần làm has no Mock of its own (ADR-0012) — every row is one of five
 * sources, each pointing at exactly one entity by id (spec #153 §10 row 9):
 * Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất thường chưa xác nhận,
 * Người thuê có Hợp đồng hiệu lực chưa Thông báo lưu trú, and kỳ hiện tại
 * chưa lập Đợt cho Toà nhà.
 */
export function deriveTasks(
  sources: TaskDerivationSources,
  today: Date = new Date(),
): Task[] {
  const {
    contracts,
    invoices,
    utilities,
    tenants,
    complianceItems,
    buildings,
  } = sources;
  const createdAt = today.toISOString();
  const currentMonth = dayjs(today).format("YYYY-MM");
  const tasks: Task[] = [];

  for (const invoice of invoices) {
    if (deriveInvoiceStatus(invoice, today) !== "OVERDUE") continue;
    tasks.push({
      id: `invoice_overdue-${invoice.id}`,
      type: "invoice_overdue",
      title: `Hoá đơn ${invoice.invoiceNumber} quá hạn`,
      description: `${invoice.tenant} — ${invoice.room}, kỳ ${invoice.month}.`,
      priority: "high",
      status: "open",
      relatedEntity: "invoice",
      relatedId: invoice.id,
      dueDate: toIsoDate(invoice.dueDate),
      createdAt,
    });
  }

  for (const contract of contracts) {
    if (deriveContractStatus(contract, today) !== "EXPIRING") continue;
    tasks.push({
      id: `contract_expiring-${contract.id}`,
      type: "contract_expiring",
      title: `Hợp đồng ${contract.contractNumber} sắp hết hạn`,
      description: `${contract.tenant} — ${contract.room}, hết hạn ${contract.endDate}.`,
      priority: "medium",
      status: "open",
      relatedEntity: "contract",
      relatedId: contract.id,
      dueDate: toIsoDate(contract.endDate),
      createdAt,
    });
  }

  for (const utility of findAnomalousUtilities(utilities)) {
    if (utility.status === "VERIFIED") continue; // "chưa xác nhận"
    tasks.push({
      id: `utility_anomaly-${utility.id}`,
      type: "utility_anomaly",
      title: `Chỉ số ${utility.roomName} bất thường`,
      description: `Tiêu thụ ${utility.consumption} kỳ ${utility.month}, cần xác minh trước khi lập Đợt.`,
      priority: "medium",
      status: "open",
      relatedEntity: "utility",
      relatedId: utility.id,
      dueDate: dayjs(today).format("YYYY-MM-DD"),
      createdAt,
    });
  }

  for (const tenant of tenants) {
    const hasLiveContract = contracts.some(
      (contract) =>
        contract.tenantId === tenant.id && isContractLive(contract, today),
    );
    if (!hasLiveContract) continue;

    const notified = complianceItems.some(
      (item) =>
        item.tenantId === tenant.id &&
        item.type === "residence_notification" &&
        item.status === "completed",
    );
    if (notified) continue;

    tasks.push({
      id: `residence_notification-${tenant.id}`,
      type: "residence_notification",
      title: `${tenant.name} chưa có Thông báo lưu trú`,
      description: `${tenant.room} — cần gửi Thông báo lưu trú cho Người thuê đang thuê.`,
      priority: "high",
      status: "open",
      relatedEntity: "tenant",
      relatedId: tenant.id,
      dueDate: dayjs(today).format("YYYY-MM-DD"),
      createdAt,
    });
  }

  for (const building of buildings) {
    const currentMonthUtilities = utilities.filter(
      (utility) =>
        utility.buildingId === building.id && utility.month === currentMonth,
    );
    const hasUnconfirmedReading = currentMonthUtilities.some(
      (utility) => utility.status !== "VERIFIED",
    );
    if (currentMonthUtilities.length === 0 || !hasUnconfirmedReading) continue;

    tasks.push({
      id: `batch_pending-${building.id}`,
      type: "batch_pending",
      title: `${building.name} chưa lập Đợt hoá đơn kỳ ${currentMonth}`,
      description: "Còn Chỉ số chưa xác nhận — xác nhận trước khi lập Đợt.",
      priority: "low",
      status: "open",
      relatedEntity: "building",
      relatedId: building.id,
      dueDate: dayjs(today).format("YYYY-MM-DD"),
      createdAt,
    });
  }

  return tasks;
}
