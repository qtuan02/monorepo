import type { SupplierBill, SupplierBillType } from "~/types/supplier-bill";
import { trackMockReset } from "~/utils/mock-reset";

/** The same six kỳ 04–09/2026 as `mockInvoices` (spec #153 §10 row 33). */
const BILLING_PERIODS = [
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
] as const;

/** Flat monthly base per Toà nhà — enough spread to tell buildings apart on screen. */
const BASE_AMOUNT: Record<string, { electricity: number; water: number }> = {
  b1: { electricity: 9_800_000, water: 1_950_000 },
  b2: { electricity: 15_400_000, water: 3_200_000 },
  b3: { electricity: 6_200_000, water: 1_400_000 },
};

const SUPPLIER_NAME: Record<SupplierBillType, string> = {
  electricity: "EVN Đà Nẵng",
  water: "Dawaco",
  trash: "Môi trường Đô thị",
  internet: "FPT Telecom",
  other: "Dịch vụ khác",
};

// Only this one Toà nhà has already paid its 09/2026 bills — the rest stay
// "Chờ thanh toán" so the payment-status facet/badge has both values to show.
const OPEN_BUILDING_INDEX = 0;

/** Paid early the following month — the current kỳ (09) is still open, per Toà nhà. */
function paymentDateFor(
  period: string,
  buildingIndex: number,
): string | undefined {
  if (period === "2026-09") {
    return buildingIndex === OPEN_BUILDING_INDEX ? "2026-09-11" : undefined;
  }
  const [year, month] = period.split("-").map(Number);
  return `${year}-${String((month ?? 1) + 1).padStart(2, "0")}-05`;
}

/** ±9% month-over-month, so consecutive kỳ aren't identical numbers. */
function withDrift(amount: number, periodIndex: number): number {
  const factor = 1 + (periodIndex - 2) * 0.03;
  return Math.round((amount * factor) / 1000) * 1000;
}

function buildElectricityWaterBills(): Omit<SupplierBill, "buildingName">[] {
  const bills: Omit<SupplierBill, "buildingName">[] = [];
  Object.entries(BASE_AMOUNT).forEach(([buildingId, base], buildingIndex) => {
    BILLING_PERIODS.forEach((period, periodIndex) => {
      bills.push({
        id: `sb-${buildingId}-electricity-${period}`,
        buildingId,
        type: "electricity",
        supplierName: SUPPLIER_NAME.electricity,
        billingPeriod: period,
        totalAmount: withDrift(base.electricity, periodIndex),
        paymentDate: paymentDateFor(period, buildingIndex),
      });
      bills.push({
        id: `sb-${buildingId}-water-${period}`,
        buildingId,
        type: "water",
        supplierName: SUPPLIER_NAME.water,
        billingPeriod: period,
        totalAmount: withDrift(base.water, periodIndex),
        paymentDate: paymentDateFor(period, buildingIndex),
      });
    });
  });
  return bills;
}

/**
 * The Mock every Hoá đơn nhà cung cấp read comes from (ADR-0012, spec #153
 * §10 row 33): an điện + nước bill per Toà nhà × kỳ (36 records), plus a
 * handful of rác/internet/khác for facet variety — down from the prototype's
 * 30 loose, unscoped records. `buildingName` is joined by the hook.
 */
export const mockSupplierBills: Omit<SupplierBill, "buildingName">[] = [
  ...buildElectricityWaterBills(),
  {
    id: "sb-b1-trash-2026-04",
    buildingId: "b1",
    type: "trash",
    supplierName: SUPPLIER_NAME.trash,
    billingPeriod: "2026-04",
    totalAmount: 550_000,
    paymentDate: "2026-05-03",
  },
  {
    id: "sb-b2-internet-2026-04",
    buildingId: "b2",
    type: "internet",
    supplierName: "Viettel Business",
    billingPeriod: "2026-04",
    totalAmount: 2_200_000,
    paymentDate: "2026-05-01",
  },
  {
    id: "sb-b3-other-2026-04",
    buildingId: "b3",
    type: "other",
    supplierName: "Bảo trì thang máy",
    billingPeriod: "2026-04",
    totalAmount: 1_800_000,
    paymentDate: "2026-05-05",
  },
  {
    id: "sb-b1-trash-2026-09",
    buildingId: "b1",
    type: "trash",
    supplierName: SUPPLIER_NAME.trash,
    billingPeriod: "2026-09",
    totalAmount: 600_000,
  },
];

export const resetMockSupplierBills = trackMockReset(mockSupplierBills);
