import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { DashboardData, DashboardParams } from "~/types/dashboard";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { queryKeysFactory } from "~/libs/query-key-factory";

// `~/constants/mock/dashboard` was dropped (ADR-0012) — "Tổng quan" is now
// read off the surviving Mocks (Phòng, Hoá đơn, Chi phí) rather than a fixed
// set of numbers, so a Building scope is a real filter and not a percentage
// applied to one shared total. `pendingTasks` / `recentActivities` stay empty
// until Việc cần làm is derived (a later ticket).
const dashboardQueryKeyFactory = queryKeysFactory("dashboard");

export const dashboardQueryKeys = {
  ...dashboardQueryKeyFactory,
  getDashboard: (params?: DashboardParams) =>
    dashboardQueryKeyFactory.list(params),
};

function monthLabel(billingMonth: string): string {
  return `Thg ${Number(billingMonth.split("-")[1])}`;
}

function buildDashboard(buildingId: string | undefined): DashboardData {
  const rooms = mockRooms.filter(
    (room) => !buildingId || room.buildingId === buildingId,
  );
  const invoices = mockInvoices.filter(
    (invoice) => !buildingId || invoice.buildingId === buildingId,
  );
  const expenses = mockExpenses.filter(
    (expense) => !buildingId || expense.buildingId === buildingId,
  );

  const occupied = rooms.filter((room) => room.status === "occupied").length;
  const vacant = rooms.filter((room) => room.status === "available").length;
  const monthlyRevenue = invoices
    .filter((invoice) => invoice.billingMonth === "2026-09")
    .reduce((total, invoice) => total + invoice.amount, 0);
  const operatingCost = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  const revenueByBillingMonth = new Map<string, number>();
  for (const invoice of invoices) {
    revenueByBillingMonth.set(
      invoice.billingMonth,
      (revenueByBillingMonth.get(invoice.billingMonth) ?? 0) + invoice.amount,
    );
  }
  const revenueByMonth = [...revenueByBillingMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([billingMonth, value]) => ({
      month: monthLabel(billingMonth),
      value: Math.round(value / 1_000_000),
    }));

  return {
    totalRooms: rooms.length,
    occupancyRate: rooms.length
      ? Math.round((occupied / rooms.length) * 1000) / 10
      : 0,
    monthlyRevenue,
    operatingCost,
    revenueByMonth,
    cashFlowByMonth: revenueByMonth.map((point) => ({
      month: point.month,
      income: point.value,
      expense: Math.round(operatingCost / 1_000_000 / 6),
    })),
    occupancy: { occupied, vacant },
    pendingTasks: [],
    recentActivities: [],
  };
}

export function useGetDashboard(
  params?: DashboardParams,
  options?: UseQueryOptionsWrapper<DashboardData>,
): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: dashboardQueryKeys.getDashboard(params),
    queryFn: async () => buildDashboard(params?.buildingId),
    ...options,
  });
}
