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
    // A copy, so the cache never holds the Mock array itself. A write into it
    // (the create-Toà-nhà mutation) still has to `invalidateQueries` on
    // `buildingQueryKeys.lists()` — the cache is served stale for a minute.
    queryFn: async () => [...mockBuildings],
    ...options,
  });
}
