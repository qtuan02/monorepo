import type {
  SupplierBill,
  SupplierBillPaymentStatus,
} from "~/types/supplier-bill";

/** Derived from `paymentDate` — the record stores no status of its own. */
export function getSupplierBillPaymentStatus(
  bill: Pick<SupplierBill, "paymentDate">,
): SupplierBillPaymentStatus {
  return bill.paymentDate ? "paid" : "pending";
}

/** The three KPI figures over the Hoá đơn nhà cung cấp in scope. */
export function getSupplierBillTotals(bills: SupplierBill[]) {
  let totalAmount = 0;
  let pendingAmount = 0;
  for (const bill of bills) {
    totalAmount += bill.totalAmount;
    if (getSupplierBillPaymentStatus(bill) === "pending") {
      pendingAmount += bill.totalAmount;
    }
  }

  return { totalAmount, pendingAmount, count: bills.length };
}
