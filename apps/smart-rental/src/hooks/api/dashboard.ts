import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { DashboardData, DashboardParams } from "~/types/dashboard";
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildTodaySummary } from "~/utils/dashboard-summary";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. `~/constants/mock/dashboard` was dropped
// (ADR-0012) — every number here is read off the surviving Mocks (Hoá đơn,
// Hợp đồng, Phòng), so a Building scope is a real filter rather than a
// percentage applied to one shared total.
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
    queryFn: async () =>
      buildTodaySummary({
        invoices: scope(mockInvoices, params?.buildingId),
        contracts: scope(mockContracts, params?.buildingId),
        rooms: scope(mockRooms, params?.buildingId),
      }),
    ...options,
  });
}
