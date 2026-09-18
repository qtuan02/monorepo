import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import dayjs from "@monorepo/dayjs";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { DashboardData, DashboardParams } from "~/types/dashboard";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildCycleProgressSummary } from "~/utils/cycle-progress";
import {
  buildMonthSummary,
  buildTodaySummary,
} from "~/utils/dashboard-summary";
import { buildRecentActivity } from "~/utils/recent-activity";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. `~/constants/mock/dashboard` was dropped
// (ADR-0012) — every number here is read off the surviving Mocks (Hoá đơn,
// Hợp đồng, Phòng, Chỉ số), so a Building scope is a real filter rather than
// a percentage applied to one shared total.
const dashboardQueryKeyFactory = queryKeysFactory("dashboard");

export const dashboardQueryKeys = {
  ...dashboardQueryKeyFactory,
  getDashboard: (params?: DashboardParams) =>
    dashboardQueryKeyFactory.list(params),
};

function scope<T extends { buildingId?: string }>(
  list: T[],
  buildingId: string | null | undefined,
): T[] {
  return buildingId
    ? list.filter((item) => item.buildingId === buildingId)
    : list;
}

export function useGetDashboard(
  params?: DashboardParams,
  options?: UseQueryOptionsWrapper<DashboardData>,
): UseQueryResult<DashboardData, Error> {
  return useQuery<DashboardData, Error>({
    queryKey: dashboardQueryKeys.getDashboard(params),
    queryFn: async () => {
      const buildingId = params?.buildingId;
      const invoices = scope(mockInvoices, buildingId);
      const contracts = scope(mockContracts, buildingId);
      const rooms = scope(mockRooms, buildingId);
      const buildings = buildingId
        ? mockBuildings.filter((building) => building.id === buildingId)
        : mockBuildings;
      const currentMonth = dayjs().format("YYYY-MM");

      return {
        ...buildTodaySummary({ invoices, contracts }),
        cycleProgress: buildCycleProgressSummary(
          buildings,
          currentMonth,
          mockRooms,
          mockContracts,
          mockUtilities,
          mockInvoices,
        ),
        monthSummary: buildMonthSummary({ invoices, rooms }),
        recentActivity: buildRecentActivity({ invoices, contracts }),
      };
    },
    ...options,
  });
}
