import type { LiquidationDecision } from "~/types/contract";
import type { Invoice } from "~/types/invoice";

/** Which derived Hoá đơn statuses still owe money — a Nháp or Đã huỷ owes nothing. */
const OWING_STATUSES = new Set<Invoice["status"]>([
  "UNPAID",
  "PARTIAL",
  "OVERDUE",
]);

/**
 * "Nợ thật" a Thanh lý trừ vào Cọc (spec #153) — the sum still unpaid across
 * a Hợp đồng's own Hoá đơn, off their already-derived status (see
 * `~/utils/invoice-status`) so a stale `OVERDUE` never under-counts.
 */
export function computeContractDebt(
  invoices: Pick<Invoice, "status" | "amount" | "paidAmount">[],
): number {
  return invoices
    .filter((invoice) => OWING_STATUSES.has(invoice.status))
    .reduce(
      (total, invoice) => total + (invoice.amount - invoice.paidAmount),
      0,
    );
}

export interface DepositSettlementInput {
  depositAmount: number;
  /** From `computeContractDebt` — never negative. */
  outstandingDebt: number;
  decision: LiquidationDecision;
  /** Only read for `PARTIAL_RETURNED` — how much of the amount left after debt to hand back. */
  partialReturnAmount?: number;
}

export interface DepositSettlementResult {
  /** The Cọc left once nợ thật is deducted — never negative. */
  availableAfterDebt: number;
  /** What the Người thuê actually gets back. */
  returnedAmount: number;
}

/**
 * Quyết toán Cọc (spec #153): the debt always comes off the Cọc first,
 * regardless of decision — `FORFEITED` then keeps the rest, `RETURNED` hands
 * all of it back, and `PARTIAL_RETURNED` hands back a landlord-chosen figure
 * clamped into `[0, availableAfterDebt]`.
 */
export function computeDepositSettlement(
  input: DepositSettlementInput,
): DepositSettlementResult {
  const availableAfterDebt = Math.max(
    0,
    input.depositAmount - input.outstandingDebt,
  );

  if (input.decision === "FORFEITED") {
    return { availableAfterDebt, returnedAmount: 0 };
  }
  if (input.decision === "RETURNED") {
    return { availableAfterDebt, returnedAmount: availableAfterDebt };
  }

  const requested = input.partialReturnAmount ?? availableAfterDebt;
  return {
    availableAfterDebt,
    returnedAmount: Math.min(Math.max(requested, 0), availableAfterDebt),
  };
}
