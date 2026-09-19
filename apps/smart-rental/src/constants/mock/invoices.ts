import type {
  Invoice,
  InvoiceLineItem,
  InvoicePayment,
  InvoiceStatus,
} from "~/types/invoice";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { buildCycleDueDate } from "~/utils/cycle-rows";
import { sumInvoicePayments } from "~/utils/invoice-payments";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * Sáu Kỳ 03–08/2026 (spec #153 — one period alone cannot feed a 6-month
 * chart or a history tab). Shifted one Kỳ back of the old 04–09 range
 * (ADR-0013): Kỳ 09 has no Hoá đơn yet — its Chỉ số are still Nháp, so it
 * cannot have been lập.
 */
const BILLING_MONTHS = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
] as const;

/** Flat preview rates per Toà nhà — the EVN tiers live in Cài đặt (a later ticket). */
const DEFAULT_CHARGE = { electric: 350_000, water: 90_000 };
const UTILITY_CHARGE: Record<string, { electric: number; water: number }> = {
  b1: DEFAULT_CHARGE,
  b2: { electric: 550_000, water: 150_000 },
  b3: { electric: 300_000, water: 80_000 },
};

/**
 * Kỳ 08/2026 — "hôm nay" 18/09/2026, đã lập Đợt (ADR-0013) — needs ≥ 3 Quá
 * hạn, ≥ 1 Thu một phần (spec #153); the rest is a mix of Đã thu / Chưa thu
 * so the list isn't a single status. Indexed against `mockContracts`, in
 * order. Hạn thu = Ngày thu của Toà nhà trong tháng 09 (kỳ kế tiếp) — days
 * 1/5/10 of September, all already past "hôm nay".
 */
const AUGUST_STATUS: InvoiceStatus[] = [
  "OVERDUE",
  "OVERDUE",
  "OVERDUE",
  "PARTIAL",
  "PAID",
  "PAID",
  "PAID",
  "PAID",
  "UNPAID",
  "UNPAID",
  "UNPAID",
  "UNPAID",
  "UNPAID",
  "UNPAID",
];

function buildLineItems(
  contract: (typeof mockContracts)[number],
): InvoiceLineItem[] {
  const charge = UTILITY_CHARGE[contract.buildingId] ?? DEFAULT_CHARGE;
  const building = mockBuildings.find((b) => b.id === contract.buildingId);

  return [
    {
      type: "RENT",
      description: "Tiền phòng",
      quantity: 1,
      unitPrice: contract.rentAmount,
      amount: contract.rentAmount,
    },
    {
      type: "ELECTRIC",
      description: "Tiền điện",
      quantity: 1,
      unitPrice: charge.electric,
      amount: charge.electric,
    },
    {
      type: "WATER",
      description: "Tiền nước",
      quantity: 1,
      unitPrice: charge.water,
      amount: charge.water,
    },
    {
      type: "SERVICE",
      description: "Phí dịch vụ",
      quantity: 1,
      unitPrice: building?.priceList.serviceFee ?? 0,
      amount: building?.priceList.serviceFee ?? 0,
    },
  ];
}

function buildDueDate(buildingId: string, billingMonth: string): string {
  const building = mockBuildings.find((b) => b.id === buildingId);
  return buildCycleDueDate(
    { collectionDay: building?.collectionDay ?? 5 },
    billingMonth,
  );
}

function buildPayments(status: InvoiceStatus, total: number): InvoicePayment[] {
  if (status === "PAID") {
    return [{ amount: total, method: "BANK_TRANSFER", paidAt: "2026-09-03" }];
  }
  if (status === "PARTIAL") {
    return [
      { amount: Math.round(total / 2), method: "CASH", paidAt: "2026-09-12" },
    ];
  }
  return [];
}

function buildInvoice(
  contract: (typeof mockContracts)[number],
  billingMonth: string,
  status: InvoiceStatus,
  sequence: number,
): Invoice {
  const lineItems = buildLineItems(contract);
  const amount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const payments = buildPayments(status, amount);
  const paidAmount = sumInvoicePayments(payments);
  const lastPayment = payments.at(-1);

  return {
    id: `I${String(sequence).padStart(3, "0")}`,
    buildingId: contract.buildingId,
    contractId: contract.id,
    invoiceNumber: `HÓA-${String(sequence).padStart(3, "0")}`,
    tenant: contract.tenant,
    room: contract.room,
    floor: contract.floor,
    amount,
    lineItems,
    payments,
    paidAmount,
    reminders: [],
    billingMonth,
    dueDate: buildDueDate(contract.buildingId, billingMonth),
    status,
    paymentDate: lastPayment ? lastPayment.paidAt : null,
    lastUpdated: "2026-09-18",
  };
}

/**
 * The Mock every Hoá đơn read comes from (ADR-0012, spec #153, ADR-0013) —
 * one per Hợp đồng per kỳ (14 × 6 = 84). Kỳ 03–07 are settled (`PAID`); 08 is
 * "hôm nay"'s kỳ and carries the mix `AUGUST_STATUS` names. Kỳ 09 has no
 * Hoá đơn at all — its Chỉ số are still Nháp (`mock/utilities.ts`).
 */
export const mockInvoices: Invoice[] = BILLING_MONTHS.flatMap(
  (billingMonth, monthIndex) =>
    mockContracts.map((contract, contractIndex) => {
      const status: InvoiceStatus =
        monthIndex === BILLING_MONTHS.length - 1
          ? (AUGUST_STATUS[contractIndex] ?? "UNPAID")
          : "PAID";
      const sequence = monthIndex * mockContracts.length + contractIndex + 1;
      return buildInvoice(contract, billingMonth, status, sequence);
    }),
);

export const resetMockInvoices = trackMockReset(mockInvoices);
