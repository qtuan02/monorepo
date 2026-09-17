/** One monthly point of a chart series; `month` is the label as drawn. */
export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expense: number;
}

export type DashboardTaskPriority = "urgent" | "high" | "medium";

export interface DashboardTask {
  id: number;
  title: string;
  type: string;
  priority: DashboardTaskPriority;
  due: string;
}

export interface DashboardActivity {
  id: number;
  action: string;
  detail: string;
  time: string;
}

/** What `/` shows for one Building scope — a summary, three series, two lists. */
export interface DashboardData {
  totalRooms: number;
  /** Percent, one decimal. */
  occupancyRate: number;
  /** VND. */
  monthlyRevenue: number;
  /** VND. */
  operatingCost: number;
  /** Doanh thu theo tháng, in triệu VND as the prototype drew it. */
  revenueByMonth: MonthlyPoint[];
  /** Thu vs chi, six months. */
  cashFlowByMonth: CashFlowPoint[];
  occupancy: { occupied: number; vacant: number };
  pendingTasks: DashboardTask[];
  recentActivities: DashboardActivity[];
}

export interface DashboardParams {
  buildingId?: string;
}
