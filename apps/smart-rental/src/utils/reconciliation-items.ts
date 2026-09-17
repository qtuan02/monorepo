import type { Expense } from "~/types/expense";
import type { Invoice, InvoiceLineItemType } from "~/types/invoice";
import type { ReconciliationItem } from "~/types/reconciliation";
import type { SupplierBill, SupplierBillType } from "~/types/supplier-bill";

type IncomeInvoice = Pick<Invoice, "buildingId" | "lineItems">;
type ExpenseBill = Pick<SupplierBill, "buildingId" | "type" | "totalAmount">;
type ExpenseLine = Pick<Expense, "buildingId" | "amount">;

/** The one service line every Đối soát row groups by — `DISCOUNT` never earns a row of its own. */
const LINE_ITEM_LABEL: Record<
  Exclude<InvoiceLineItemType, "DISCOUNT">,
  string
> = {
  RENT: "Tiền phòng",
  ELECTRIC: "Tiền điện",
  WATER: "Tiền nước",
  SERVICE: "Phí dịch vụ",
  EXTRA: "Phụ thu",
};

/** Which Hoá đơn line a Hoá đơn nhà cung cấp's spend counts against. */
const SUPPLIER_BILL_LINE: Record<
  SupplierBillType,
  Exclude<InvoiceLineItemType, "DISCOUNT">
> = {
  electricity: "ELECTRIC",
  water: "WATER",
  trash: "SERVICE",
  internet: "SERVICE",
  other: "SERVICE",
};

/**
 * Đối soát has no Mock of its own (ADR-0012, spec #153 §10 row 11) — thu from
 * a Hoá đơn's own line items, chi from Hoá đơn nhà cung cấp + Chi phí (both
 * folded into the line their `type`/`category` counts against), scoped to
 * one Toà nhà. A line with no income and no expense at all is left out.
 */
export function buildReconciliationItems(
  invoices: IncomeInvoice[],
  supplierBills: ExpenseBill[],
  expenses: ExpenseLine[],
  buildingId?: string | null,
): ReconciliationItem[] {
  const scope = <T extends { buildingId?: string }>(list: T[]): T[] =>
    buildingId ? list.filter((item) => item.buildingId === buildingId) : list;

  const incomeByLine = new Map<string, number>();
  for (const invoice of scope(invoices)) {
    for (const lineItem of invoice.lineItems) {
      if (lineItem.type === "DISCOUNT") continue;
      incomeByLine.set(
        lineItem.type,
        (incomeByLine.get(lineItem.type) ?? 0) + lineItem.amount,
      );
    }
  }

  const expenseByLine = new Map<string, number>();
  for (const bill of scope(supplierBills)) {
    const line = SUPPLIER_BILL_LINE[bill.type];
    expenseByLine.set(line, (expenseByLine.get(line) ?? 0) + bill.totalAmount);
  }
  // Chi phí has no service type of its own — folded into "Phí dịch vụ".
  for (const expense of scope(expenses)) {
    expenseByLine.set(
      "SERVICE",
      (expenseByLine.get("SERVICE") ?? 0) + expense.amount,
    );
  }

  return (Object.keys(LINE_ITEM_LABEL) as (keyof typeof LINE_ITEM_LABEL)[])
    .map((type) => {
      const incomeAmount = incomeByLine.get(type) ?? 0;
      const expenseAmount = expenseByLine.get(type) ?? 0;
      const netAmount = incomeAmount - expenseAmount;
      const item: ReconciliationItem = {
        id: `${buildingId ?? "all"}-${type}`,
        buildingId: buildingId ?? "all",
        lineItemName: LINE_ITEM_LABEL[type],
        incomeAmount,
        expenseAmount,
        netAmount,
        status: netAmount >= 0 ? "gain" : "loss",
      };
      return item;
    })
    .filter((item) => item.incomeAmount > 0 || item.expenseAmount > 0);
}
