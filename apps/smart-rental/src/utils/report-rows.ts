import type { Building } from "~/types/building";
import type { Expense } from "~/types/expense";
import type { Invoice } from "~/types/invoice";
import type { OverdueDebt, ProfitLossSummary, ReportRow } from "~/types/report";
import type { Room } from "~/types/room";
import type { TenantView } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import type { CsvColumn } from "~/utils/csv";
import { toCsv } from "~/utils/csv";
import { formatMonth } from "~/utils/date";
import { daysOverdue, deriveInvoiceStatus } from "~/utils/invoice-status";

interface ReportRowSources {
  buildings: Building[];
  rooms: Room[];
  invoices: Invoice[];
  expenses: Pick<Expense, "buildingId" | "amount" | "expenseDate">[];
  utilities: Utility[];
  tenantViews: TenantView[];
  buildingId?: string | null;
}

/**
 * Báo cáo has no Mock of its own (ADR-0012, spec #153 §10 row 11) — one row
 * per Toà nhà × kỳ hoá đơn. Occupancy and công nợ are a live snapshot (the
 * Mock keeps no history of either), so they repeat across every kỳ of the
 * same Toà nhà; revenue/expenses/tiêu thụ vary by kỳ.
 *
 * ponytail: floor breakdown is skipped — Chi phí carries no floor of its own,
 * so a per-floor split would either double-count or fake a number nothing in
 * the Mock backs. Upgrade to real per-floor rows once `be-motel` returns one.
 */
export function buildReportRows(sources: ReportRowSources): ReportRow[] {
  const {
    buildings,
    rooms,
    invoices,
    expenses,
    utilities,
    tenantViews,
    buildingId,
  } = sources;
  const scopedBuildings = buildingId
    ? buildings.filter((building) => building.id === buildingId)
    : buildings;
  const months = [
    ...new Set(invoices.map((invoice) => invoice.billingMonth)),
  ].sort();

  const rows: ReportRow[] = [];
  for (const building of scopedBuildings) {
    const buildingRooms = rooms.filter(
      (room) => room.buildingId === building.id,
    );
    const occupiedCount = buildingRooms.filter(
      (room) => room.status === "occupied",
    ).length;
    const occupancyRate = buildingRooms.length
      ? Math.round((occupiedCount / buildingRooms.length) * 1000) / 10
      : 0;

    const buildingTenants = tenantViews.filter(
      (tenant) => tenant.buildingId === building.id,
    );
    const totalTenants = buildingTenants.length;
    const overdueTenants = buildingTenants.filter(
      (tenant) => tenant.hasOverdueInvoice,
    ).length;

    for (const month of months) {
      const monthInvoices = invoices.filter(
        (invoice) =>
          invoice.buildingId === building.id && invoice.billingMonth === month,
      );
      const revenue = monthInvoices.reduce(
        (sum, invoice) => sum + invoice.amount,
        0,
      );
      const monthExpenses = expenses
        .filter(
          (expense) =>
            expense.buildingId === building.id &&
            expense.expenseDate.startsWith(month),
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
      const monthUtilities = utilities.filter(
        (utility) =>
          utility.buildingId === building.id && utility.month === month,
      );
      const electricityUsage = monthUtilities
        .filter((utility) => utility.type === "electricity")
        .reduce((sum, utility) => sum + utility.consumption, 0);
      const waterUsage = monthUtilities
        .filter((utility) => utility.type === "water")
        .reduce((sum, utility) => sum + utility.consumption, 0);

      rows.push({
        month: formatMonth(month),
        building: building.name,
        floor: "Tất cả tầng",
        revenue,
        expenses: monthExpenses,
        profit: revenue - monthExpenses,
        occupancyRate,
        waterUsage,
        electricityUsage,
        overdueTenants,
        totalTenants,
      });
    }
  }
  return rows;
}

const REPORT_ROW_CSV_COLUMNS: CsvColumn<ReportRow>[] = [
  { key: "month", header: "Tháng" },
  { key: "building", header: "Toà nhà" },
  { key: "floor", header: "Tầng" },
  { key: "revenue", header: "Doanh thu" },
  { key: "expenses", header: "Chi phí" },
  { key: "profit", header: "Lợi nhuận" },
  { key: "occupancyRate", header: "Lấp đầy (%)" },
  { key: "electricityUsage", header: "Điện (kWh)" },
  { key: "waterUsage", header: "Nước (m³)" },
  { key: "totalTenants", header: "Tổng người thuê" },
  { key: "overdueTenants", header: "Người thuê quá hạn" },
];

/** "Xuất báo cáo" (spec #153 §10 row 13) — the P&L rows as CSV. */
export function buildReportRowsCsv(rows: ReportRow[]): string {
  return toCsv(rows, REPORT_ROW_CSV_COLUMNS);
}

export function buildProfitLossSummary(rows: ReportRow[]): ProfitLossSummary {
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalExpenses = rows.reduce((sum, row) => sum + row.expenses, 0);
  const avgOccupancy = rows.length
    ? Math.round(
        (rows.reduce((sum, row) => sum + row.occupancyRate, 0) / rows.length) *
          10,
      ) / 10
    : 0;

  return {
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    avgOccupancy,
  };
}

/** "Công nợ quá hạn": one row per Hoá đơn that derives `OVERDUE`. */
export function buildOverdueDebts(
  invoices: Invoice[],
  today: Date = new Date(),
): OverdueDebt[] {
  return invoices
    .filter((invoice) => deriveInvoiceStatus(invoice, today) === "OVERDUE")
    .map((invoice) => ({
      id: invoice.id,
      tenant: invoice.tenant,
      room: invoice.room,
      amount: invoice.amount - invoice.paidAmount,
      daysOverdue: daysOverdue(invoice.dueDate, today),
      reason: `Hoá đơn ${invoice.invoiceNumber} kỳ ${invoice.month} chưa thanh toán đủ.`,
    }));
}
