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
import { isCycleClosingDatePassed } from "~/utils/cycle-rows";
import { formatMonth } from "~/utils/date";
import { deriveInvoiceStatus } from "~/utils/invoice-status";
import { buildResidenceDeclarations } from "~/utils/residence-declaration";
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
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

/**
 * Việc cần làm has no Mock of its own (ADR-0012) — every row is one of six
 * sources, each pointing at exactly one entity by id (spec #153 §10 row 9,
 * ticket #188): Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất thường
 * chưa xác nhận, Người thuê có Hợp đồng hiệu lực chưa Thông báo lưu trú,
 * Đăng ký tạm trú sắp hết hạn (30 ngày), and kỳ hiện tại chưa lập Đợt cho
 * Toà nhà.
 */
export function deriveTasks(
  sources: TaskDerivationSources,
  today: Date = new Date(),
): Task[] {
  const { buildingId } = sources;
  const scope = <T extends { buildingId?: string }>(list: T[]): T[] =>
    buildingId ? list.filter((item) => item.buildingId === buildingId) : list;

  const contracts = scope(sources.contracts);
  const invoices = scope(sources.invoices);
  const utilities = scope(sources.utilities);
  const tenants = scope(sources.tenants);
  const complianceItems = scope(sources.complianceItems);
  const buildings = buildingId
    ? sources.buildings.filter((building) => building.id === buildingId)
    : sources.buildings;

  const createdAt = today.toISOString();
  const todayIso = dayjs(today).format("YYYY-MM-DD");
  const currentMonth = dayjs(today).format("YYYY-MM");
  const tasks: Task[] = [];

  for (const invoice of invoices) {
    if (deriveInvoiceStatus(invoice, today) !== "OVERDUE") continue;
    tasks.push({
      id: `invoice_overdue-${invoice.id}`,
      type: "invoice_overdue",
      title: `Hoá đơn ${invoice.invoiceNumber} quá hạn`,
      description: `${invoice.tenant} — ${invoice.room}, kỳ ${invoice.month}.`,
      status: "open",
      buildingId: invoice.buildingId ?? "",
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
      status: "open",
      buildingId: contract.buildingId,
      relatedEntity: "contract",
      relatedId: contract.id,
      dueDate: toIsoDate(contract.endDate),
      createdAt,
    });
  }

  for (const utility of findAnomalousUtilities(utilities)) {
    if (utility.status === "FINALIZED") continue; // "chưa chốt"
    tasks.push({
      id: `utility_anomaly-${utility.id}`,
      type: "utility_anomaly",
      title: `Chỉ số ${utility.roomName} bất thường`,
      description: `Tiêu thụ ${utility.consumption} kỳ ${formatMonth(utility.month)}, cần duyệt trước khi lập Đợt.`,
      status: "open",
      buildingId: utility.buildingId,
      // Points at the Kỳ screen's own row (spec #179 §"Hôm nay") — the one
      // place a bất thường is actually duyệt-able, not the read-only
      // /utilities/:id history.
      relatedEntity: "cycle",
      relatedId: utility.month,
      dueDate: todayIso,
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
      status: "open",
      buildingId: tenant.buildingId,
      relatedEntity: "tenant",
      relatedId: tenant.id,
      dueDate: todayIso,
      createdAt,
    });
  }

  // Đăng ký tạm trú sắp hết hạn (ticket #188) — same 30-day window
  // `buildResidenceDeclarations` already suy ra, so the derivation stays in
  // one place rather than a second days-to-expiry calc here.
  for (const declaration of buildResidenceDeclarations(
    tenants,
    contracts,
    complianceItems,
    today,
  )) {
    if (!declaration.registrationExpiringSoon) continue;

    tasks.push({
      id: `residence_registration_expiring-${declaration.tenantId}`,
      type: "residence_registration_expiring",
      title: `Đăng ký tạm trú của ${declaration.tenantName} sắp hết hạn`,
      description: `${declaration.room} — hết hạn ${declaration.registrationDueDate}.`,
      status: "open",
      buildingId: declaration.buildingId,
      relatedEntity: "tenant",
      relatedId: declaration.tenantId,
      dueDate: toIsoDate(declaration.registrationDueDate),
      createdAt,
    });
  }

  // "Kỳ chưa lập Đợt" is suy from Hoá đơn, not Chỉ số (ADR-0013) — a building
  // with no Hoá đơn of the current Kỳ yet, and only once the Kỳ's own ngày
  // chốt (cuối tháng) has passed. Đang chốt dở, still within the month, is
  // not yet a Việc — it is the Kỳ progress KPI's job to say so.
  if (isCycleClosingDatePassed(currentMonth, today)) {
    for (const building of buildings) {
      const hasInvoicesThisCycle = invoices.some(
        (invoice) =>
          invoice.buildingId === building.id &&
          invoice.billingMonth === currentMonth,
      );
      if (hasInvoicesThisCycle) continue;

      tasks.push({
        id: `batch_pending-${building.id}`,
        type: "batch_pending",
        title: `${building.name} chưa lập Đợt hoá đơn kỳ ${formatMonth(currentMonth)}`,
        description: `Kỳ ${formatMonth(currentMonth)} chưa có Hoá đơn nào được lập.`,
        status: "open",
        buildingId: building.id,
        relatedEntity: "building",
        relatedId: building.id,
        dueDate: todayIso,
        createdAt,
      });
    }
  }

  return tasks;
}
