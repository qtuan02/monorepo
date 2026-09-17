export type ReconciliationStatus = "gain" | "loss";

/** The prototype's `ReconciliationItem`, shape kept 1:1 until `be-motel` has a contract. */
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

export interface ReconciliationListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}
