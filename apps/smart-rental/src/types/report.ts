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

export interface OverdueDebt {
  id: string;
  tenant: string;
  room: string;
  amount: number;
  daysOverdue: number;
  reason: string;
}

export interface ProfitLossSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  avgOccupancy: number;
}

/** The prototype's three occupancy bands: ≥ 90 good, ≥ 70 warning, else critical. */
export type OccupancyBucket = "good" | "warning" | "critical";
