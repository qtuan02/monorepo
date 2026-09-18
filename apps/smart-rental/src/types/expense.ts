/** The prototype's `Expense`, shape kept 1:1 until `be-motel` has a contract. */
export interface Expense {
  id: string;
  buildingId: string;
  /** Joined from the Toà nhà Mock by the hook — never stored on the record. */
  buildingName: string;
  /** Free text in the prototype ("Bảo trì", "Vệ sinh", …), not an enum. */
  category: string;
  amount: number;
  description?: string;
  /** ISO date. */
  expenseDate: string;
  receiptImageUrl?: string;
}

export interface ExpenseListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export interface CreateExpenseRequest {
  buildingId: string;
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
  receiptImageUrl?: string;
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  expenseId: string;
}
