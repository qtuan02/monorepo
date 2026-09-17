import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import dayjs from "@monorepo/dayjs";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  DashboardData,
  DashboardParams,
  DashboardTask,
} from "~/types/dashboard";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { taskTypeConfig } from "~/constants/status";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { deriveTasks } from "~/utils/task-derivation";

// `~/constants/mock/dashboard` was dropped (ADR-0012) — "Hôm nay" is now
// read off the surviving Mocks (Phòng, Hoá đơn, Chi phí) rather than a fixed
// set of numbers, so a Building scope is a real filter and not a percentage
// applied to one shared total. `recentActivities` stays empty — no Mock
// models an activity log yet.
const dashboardQueryKeyFactory = queryKeysFactory("dashboard");

const DASHBOARD_TASK_PRIORITY = {
  high: "urgent",
  medium: "high",
  low: "medium",
} as const;

// A copy of ~/features/tasks/utils/task-due's due label — `~/hooks/api` may
// not import a feature module (architecture-circular-dependencies), so the
// five-line format stays duplicated rather than importing across the layer.
function dueLabel(dueDate: string, today: Date): string {
  const days = dayjs(dueDate)
    .startOf("day")
    .diff(dayjs(today).startOf("day"), "day");
  if (days < 0) return `Quá hạn ${-days} ngày`;
  if (days === 0) return "Hôm nay";
  return `Còn ${days} ngày`;
}

/** The dashboard's own five-ish soonest, from the same `deriveTasks` "Việc cần làm" reads. */
function buildPendingTasks(buildingId: string | undefined): DashboardTask[] {
  const today = new Date();
  return deriveTasks({
    contracts: mockContracts,
    invoices: mockInvoices,
    utilities: mockUtilities,
    tenants: mockTenants,
    complianceItems: mockComplianceItems,
    buildings: mockBuildings,
    buildingId,
  })
    .slice(0, 5)
    .map((task, index) => ({
      id: index,
      title: task.title,
      type: taskTypeConfig[task.type].label,
      priority: DASHBOARD_TASK_PRIORITY[task.priority],
      due: dueLabel(task.dueDate, today),
    }));
}

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
    pendingTasks: buildPendingTasks(buildingId),
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
