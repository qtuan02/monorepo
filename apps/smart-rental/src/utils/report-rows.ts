import type { Building } from "~/types/building";
import type { Expense } from "~/types/expense";
import type { Invoice } from "~/types/invoice";
import type {
  BuildingComparisonRow,
  FloorOccupancy,
  OccupancyBucket,
  ProfitLossSummary,
  ReportRow,
} from "~/types/report";
import type { Room } from "~/types/room";
import type { TenantView } from "~/types/tenant";
import type { Utility } from "~/types/utility";
import type { CsvColumn } from "~/utils/csv";
import { toCsv } from "~/utils/csv";
import { formatMonth } from "~/utils/date";

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

const BUILDING_COMPARISON_CSV_COLUMNS: CsvColumn<BuildingComparisonRow>[] = [
  { key: "building", header: "Toà nhà" },
  { key: "revenue", header: "Doanh thu" },
  { key: "expenses", header: "Chi phí" },
  { key: "profit", header: "Lợi nhuận" },
  { key: "occupancyRate", header: "Lấp đầy (%)" },
];

/** "Xuất báo cáo", scope `null` — the comparison rows as CSV. */
export function buildBuildingComparisonCsv(
  rows: BuildingComparisonRow[],
): string {
  return toCsv(rows, BUILDING_COMPARISON_CSV_COLUMNS);
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

/** The band a rate falls in (spec #153 §10 row 11's table badge). */
export function occupancyBucket(occupancyRate: number): OccupancyBucket {
  if (occupancyRate >= 90) return "good";
  if (occupancyRate >= 70) return "warning";
  return "critical";
}

/**
 * "Lấp đầy theo tầng" (spec #153 §10 row 29, one Toà nhà scope): Phòng
 * already carries its own `floor`, so this needs no Chi phí join — unlike
 * `buildReportRows`'s per-building occupancyRate, it never has to fake a
 * per-floor split of a cost the Mock keeps whole-building.
 */
export function buildFloorOccupancy(rooms: Room[]): FloorOccupancy[] {
  const byFloor = new Map<number, Room[]>();
  for (const room of rooms) {
    byFloor.set(room.floor, [...(byFloor.get(room.floor) ?? []), room]);
  }

  return [...byFloor.entries()]
    .sort(([a], [b]) => a - b)
    .map(([floor, floorRooms]) => ({
      floor,
      occupancyRate: Math.round(
        (floorRooms.filter((room) => room.status === "occupied").length /
          floorRooms.length) *
          100,
      ),
    }));
}

/**
 * "Bảng so sánh giữa các Toà nhà" (spec #153 §10 row 29, scope `null`): one
 * row per Toà nhà, totalled across every kỳ `buildReportRows` returned for
 * it — never averaged, so "Doanh thu" reads as a real six-month figure.
 */
export function buildBuildingComparisonRows(
  rows: ReportRow[],
): BuildingComparisonRow[] {
  const byBuilding = new Map<string, ReportRow[]>();
  for (const row of rows) {
    byBuilding.set(row.building, [
      ...(byBuilding.get(row.building) ?? []),
      row,
    ]);
  }

  return [...byBuilding.entries()].map(([building, buildingRows]) => {
    const summary = buildProfitLossSummary(buildingRows);
    return {
      building,
      revenue: summary.totalRevenue,
      expenses: summary.totalExpenses,
      profit: summary.totalProfit,
      // Constant across a building's own rows (buildReportRows repeats the
      // same live snapshot per kỳ), so the average is that one value.
      occupancyRate: summary.avgOccupancy,
    };
  });
}
