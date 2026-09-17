import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { DashboardData, DashboardParams } from "~/types/dashboard";
import { getMockDashboard } from "~/constants/mock/dashboard";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock. Wiring `be-motel` later is swapping that line for a
// service singleton from `~/libs/http-client`.
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
    // The Building scope is a query param, as it will be on the backend.
    queryFn: async () => getMockDashboard(params?.buildingId ?? null),
    ...options,
  });
}
