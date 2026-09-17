import type { ReconciliationItem } from "~/types/reconciliation";

/**
 * The Mock every Đối soát read comes from (spec #127). The lines are not
 * computed from Hoá đơn and Hoá đơn nhà cung cấp — the prototype never did,
 * and the backend will own that join.
 */
export const mockReconciliationItems: ReconciliationItem[] = [
  {
    id: "rec-1",
    buildingId: "b1",
    lineItemName: "Tiền điện",
    incomeAmount: 18500000,
    expenseAmount: 15200000,
    netAmount: 3300000,
    status: "gain",
    trendRate: 5.2,
  },
  {
    id: "rec-2",
    buildingId: "b1",
    lineItemName: "Tiền nước",
    incomeAmount: 2800000,
    expenseAmount: 2400000,
    netAmount: 400000,
    status: "gain",
    trendRate: 2.1,
  },
  {
    id: "rec-3",
    buildingId: "b1",
    lineItemName: "Rác thải",
    incomeAmount: 1200000,
    expenseAmount: 1000000,
    netAmount: 200000,
    status: "gain",
  },
  {
    id: "rec-4",
    buildingId: "b1",
    lineItemName: "Internet",
    incomeAmount: 750000,
    expenseAmount: 880000,
    netAmount: -130000,
    status: "loss",
    trendRate: -1.5,
  },
  {
    id: "rec-5",
    buildingId: "b2",
    lineItemName: "Tiền điện",
    incomeAmount: 12400000,
    expenseAmount: 11000000,
    netAmount: 1400000,
    status: "gain",
    trendRate: 3.8,
  },
  {
    id: "rec-6",
    buildingId: "b2",
    lineItemName: "Tiền nước",
    incomeAmount: 1500000,
    expenseAmount: 1650000,
    netAmount: -150000,
    status: "loss",
    trendRate: -2.4,
  },
  {
    id: "rec-7",
    buildingId: "b3",
    lineItemName: "Tiền điện",
    incomeAmount: 25000000,
    expenseAmount: 21500000,
    netAmount: 3500000,
    status: "gain",
    trendRate: 8.1,
  },
];
