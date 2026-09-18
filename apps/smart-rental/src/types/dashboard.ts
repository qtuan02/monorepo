/**
 * One monthly point of `~/components/chart/revenue-chart` — still named here
 * even though Hôm nay no longer plots one itself (Báo cáo does), because the
 * shared chart component's own type home is this file.
 */
export interface MonthlyPoint {
  month: string;
  value: number;
}

/** "Còn phải thu tháng này" — outstanding on every Hoá đơn whose hạn thu falls in the current month. */
export interface OutstandingThisMonthSummary {
  amount: number;
  /** Trong đó, bao nhiêu Hoá đơn đã quá hạn — the KPI's own red dòng phụ. */
  overdueCount: number;
}

/** "Hợp đồng sắp hết hạn" — the soonest one named for the KPI's dòng phụ. */
export interface ExpiringContractsSummary {
  count: number;
  /** Already display-formatted (`DD/MM/YYYY`); unset when `count` is 0. */
  nearestEndDate?: string;
}

/**
 * "Chỉ số kỳ MM/YYYY x/y phòng" — x đã nhập đủ chỉ số / y phòng đang thuê
 * của kỳ hiện tại (ADR-0013), off the same `buildCycleRows` the màn Kỳ reads.
 */
export interface CycleProgressSummary {
  /** `YYYY-MM`. */
  month: string;
  entered: number;
  total: number;
  anomalyCount: number;
  /** True once every occupied Phòng of the kỳ already has a Hoá đơn. */
  allInvoiced: boolean;
}

/** "Tháng này" — the card that replaces the old donut + 6-tháng chart on Hôm nay. */
export interface MonthSummary {
  /** `MM/YYYY`. */
  month: string;
  occupiedRooms: number;
  totalRooms: number;
  /** Tổng Hoá đơn có hạn thu trong tháng này — không phân biệt đã thu hay chưa. */
  invoicedAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export type RecentActivityKind = "payment" | "reminder" | "renewal";

/** "Vừa xong" — one of the three most recent Thanh toán/Nhắc/Gia hạn events. */
export interface RecentActivityEntry {
  kind: RecentActivityKind;
  /** ISO timestamp — the sort key. */
  at: string;
  label: string;
  detail: string;
}

/**
 * What "Hôm nay" shows for one Building scope (spec #179 §"Hôm nay") — three
 * KPIs, "Tháng này" and "Vừa xong", every one read off Hoá đơn/Hợp đồng/
 * Phòng/Chỉ số at call time (ADR-0012). Việc cần làm is not here — the
 * screen reads it straight off `~/hooks/api/task`, the same hook the bell
 * uses.
 */
export interface TodaySummary {
  outstandingThisMonth: OutstandingThisMonthSummary;
  expiringContracts: ExpiringContractsSummary;
  cycleProgress: CycleProgressSummary;
  monthSummary: MonthSummary;
  recentActivity: RecentActivityEntry[];
}

/** The hook's own return type — an alias, so a call site never names the internal shape twice. */
export type DashboardData = TodaySummary;

export interface DashboardParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}
