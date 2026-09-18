import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Utility, UtilityListParams } from "~/types/utility";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers through `readWorld` (ADR-0015), the Building scope as a query param.
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
      readWorld(params?.buildingId ?? null).utilities.filter(
        (utility) => !params?.roomId || utility.roomId === params.roomId,
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
      readWorld(null).utilities.find((utility) => utility.id === utilityId) ??
      null,
    ...options,
  });
}
