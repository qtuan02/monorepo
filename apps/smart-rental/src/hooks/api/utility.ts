import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Utility, UtilityListParams } from "~/types/utility";
import { mockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock, the Building scope as a query param.
const utilityQueryKeyFactory = queryKeysFactory("utility");

export const utilityQueryKeys = {
  ...utilityQueryKeyFactory,
  getUtilities: (params?: UtilityListParams) =>
    utilityQueryKeyFactory.list(params),
  getUtility: (utilityId: string) => utilityQueryKeyFactory.detail(utilityId),
};

export function useGetUtilities(
  params?: UtilityListParams,
  options?: UseQueryOptionsWrapper<Utility[]>,
): UseQueryResult<Utility[], Error> {
  return useQuery<Utility[], Error>({
    queryKey: utilityQueryKeys.getUtilities(params),
    queryFn: async () =>
      mockUtilities.filter(
        (utility) =>
          (!params?.buildingId || utility.buildingId === params.buildingId) &&
          (!params?.roomId || utility.roomId === params.roomId),
      ),
    ...options,
  });
}

export function useGetUtility(
  utilityId: string,
  options?: UseQueryOptionsWrapper<Utility | null>,
): UseQueryResult<Utility | null, Error> {
  return useQuery<Utility | null, Error>({
    queryKey: utilityQueryKeys.getUtility(utilityId),
    queryFn: async () =>
      mockUtilities.find((utility) => utility.id === utilityId) ?? null,
    ...options,
  });
}
