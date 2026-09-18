/** The prototype's report shapes, kept 1:1 until `be-motel` has a contract. */
export interface ReportRow {
  /** `MM/YYYY`. */
  month: string;
  building: string;
  floor: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancyRate: number;
  waterUsage: number;
  electricityUsage: number;
  overdueTenants: number;
  totalTenants: number;
}

export interface ProfitLossSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgOccupancy: number;
}

/** The prototype's three occupancy bands: ≥ 90 good, ≥ 70 warning, else critical. */
export type OccupancyBucket = "good" | "warning" | "critical";

/** "Lấp đầy theo tầng" — one Toà nhà scope's chart (spec #153 §10 row 29). */
export interface FloorOccupancy {
  floor: number;
  occupancyRate: number;
}

/** One row of "bảng so sánh giữa các Toà nhà" — scope `null` (spec #153 §10 row 29). */
export interface BuildingComparisonRow {
  building: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancyRate: number;
}
