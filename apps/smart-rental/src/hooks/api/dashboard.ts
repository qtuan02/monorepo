import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import dayjs from "@monorepo/dayjs";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { DashboardData, DashboardParams } from "~/types/dashboard";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildCycleProgressSummary } from "~/utils/cycle-progress";
import {
  buildMonthSummary,
  buildTodaySummary,
} from "~/utils/dashboard-summary";
import { buildRecentActivity } from "~/utils/recent-activity";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. `~/constants/mock/dashboard` was dropped
// (ADR-0012) — every number here is read off `readWorld` (ADR-0015), so a
// Building scope is a real filter rather than a percentage applied to one
// shared total.
const dashboardQueryKeyFactory = queryKeysFactory("dashboard");

export const dashboardQueryKeys = {
  ...dashboardQueryKeyFactory,
  getDashboard: (params?: DashboardParams) =>
    dashboardQueryKeyFactory.list(params),
};

export function useGetDashboard(
  params?: DashboardParams,
  options?: UseQueryOptionsWrapper<DashboardData>,
): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: dashboardQueryKeys.getDashboard(params),
    queryFn: async () => {
      const world = readWorld(params?.buildingId ?? null);
      const currentMonth = dayjs(world.today).format("YYYY-MM");

      return {
        ...buildTodaySummary(world),
        cycleProgress: buildCycleProgressSummary(world, currentMonth),
        monthSummary: buildMonthSummary(world),
        recentActivity: buildRecentActivity({
          invoices: world.invoices,
          contracts: world.contracts,
        }),
      };
    },
    ...options,
  });
}
