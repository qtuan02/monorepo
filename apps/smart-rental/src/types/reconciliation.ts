/** The prototype's `ReconciliationItem`, shape kept 1:1 until `be-motel` has a contract. */
export type ReconciliationStatus = "gain" | "loss";

export interface ReconciliationItem {
  id: string;
  buildingId: string;
  /** "Tiền điện", "Tiền nước", … — one service line of a Toà nhà. */
  lineItemName: string;
  incomeAmount: number;
  expenseAmount: number;
  netAmount: number;
  status: ReconciliationStatus;
  /** Percent change against the previous period, when the Mock has one. */
  trendRate?: number;
}

export interface ReconciliationStats {
  totalIncomeAmount: number;
  totalExpenseAmount: number;
  netProfitAmount: number;
  /** Percent of income kept, to one decimal; 0 when there is no income. */
  profitMargin: number;
}

export interface ReconciliationListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}
