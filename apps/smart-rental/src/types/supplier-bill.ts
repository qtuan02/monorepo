/** The prototype's `SupplierBill`, shape kept 1:1 until `be-motel` has a contract. */
export type SupplierBillType =
  | "electricity"
  | "water"
  | "trash"
  | "internet"
  | "other";

export interface SupplierBill {
  id: string;
  buildingId: string;
  /** Joined from the Toà nhà Mock by the hook — never stored on the record. */
  buildingName: string;
  type: SupplierBillType;
  supplierName: string;
  /** The billing period as `YYYY-MM`. */
  billingPeriod: string;
  totalAmount: number;
  totalMeterIndex?: number;
  /** ISO date; absent while the bill is still unpaid. */
  paymentDate?: string;
  invoiceImageUrl?: string;
}

export interface SupplierBillListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

/** Derived from `paymentDate` — the record stores no status of its own. */
export type SupplierBillPaymentStatus = "paid" | "pending";

export interface CreateSupplierBillRequest {
  buildingId: string;
  type: SupplierBillType;
  supplierName: string;
  billingPeriod: string;
  totalAmount: number;
  totalMeterIndex?: number;
  paymentDate?: string;
  invoiceImageUrl?: string;
}

export interface UpdateSupplierBillRequest extends CreateSupplierBillRequest {
  billId: string;
}
