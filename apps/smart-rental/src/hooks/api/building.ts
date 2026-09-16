import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Building } from "~/types/building";
import { mockBuildings } from "~/constants/mock/buildings";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The shape every slice copies (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. Wiring `be-motel` later is swapping that one line
// for a service singleton from `~/libs/http-client`.
const buildingQueryKeyFactory = queryKeysFactory("building");

export const buildingQueryKeys = {
  ...buildingQueryKeyFactory,
  getBuildings: () => buildingQueryKeyFactory.list(),
};

export function useGetBuildings(options?: UseQueryOptionsWrapper<Building[]>) {
  return useQuery<Building[], Error>({
    queryKey: buildingQueryKeys.getBuildings(),
    // A copy, so a write into the Mock array is a new reference to the cache.
    queryFn: async () => [...mockBuildings],
    ...options,
  });
}
