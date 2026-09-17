/** One monthly point of the revenue chart; `month` is the label as drawn. */
export interface MonthlyPoint {
  month: string;
  value: number;
}

/** "Cần thu tháng này" — invoices of the current kỳ still owing something. */
export interface DueThisMonthSummary {
  amount: number;
  count: number;
}

/** "Quá hạn" — every invoice past its due date, any kỳ. */
export interface OverdueSummary {
  amount: number;
  count: number;
  maxDaysOverdue: number;
}

/** "Hợp đồng hết hạn trong 30 ngày" — the soonest one named for the KPI's description. */
export interface ExpiringContractsSummary {
  count: number;
  /** Already display-formatted (`DD/MM/YYYY`); unset when `count` is 0. */
  nearestEndDate?: string;
  nearestRoom?: string;
}

export interface OccupancySummary {
  occupied: number;
  vacant: number;
  vacantRoomNames: string[];
}

/**
 * What "Hôm nay" shows for one Building scope — three KPIs, an occupancy
 * donut and a six-month revenue trend, every one read off Hoá đơn/Hợp đồng/
 * Phòng at call time (ADR-0012). Việc cần làm is not here — the screen reads
 * it straight off `~/hooks/api/task`, the same hook `/tasks` uses.
 */
export interface TodaySummary {
  dueThisMonth: DueThisMonthSummary;
  overdue: OverdueSummary;
  expiringContracts: ExpiringContractsSummary;
  occupancy: OccupancySummary;
  revenueByMonth: MonthlyPoint[];
}

/** The hook's own return type — an alias, so a call site never names the internal shape twice. */
export type DashboardData = TodaySummary;

export interface DashboardParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}
