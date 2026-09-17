import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { Building, CreateBuildingRequest } from "~/types/building";
import { mockBuildings } from "~/constants/mock/buildings";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The shape every slice copies (spec #127): keys from the factory, a `queryFn`
// that answers with the Mock. Wiring `be-motel` later is swapping that one line
// for a service singleton from `~/libs/http-client`.
const buildingQueryKeyFactory = queryKeysFactory("building");

export const buildingQueryKeys = {
  ...buildingQueryKeyFactory,
  getBuildings: () => buildingQueryKeyFactory.list(),
  getBuilding: (buildingId: string) =>
    buildingQueryKeyFactory.detail(buildingId),
};

// The explicit return type is load-bearing: without it Biome cannot see through
// `useQuery` and reads `isLoading` as always false at every call site.
export function useGetBuildings(
  options?: UseQueryOptionsWrapper<Building[]>,
): UseQueryResult<Building[], Error> {
  return useQuery<Building[], Error>({
    queryKey: buildingQueryKeys.getBuildings(),
    // A copy, so the cache never holds the Mock array itself; the create
    // mutation below invalidates `lists()` after writing into it.
    queryFn: async () => [...mockBuildings],
    ...options,
  });
}

export function useGetBuilding(
  buildingId: string,
  options?: UseQueryOptionsWrapper<Building | null>,
): UseQueryResult<Building | null, Error> {
  return useQuery<Building | null, Error>({
    queryKey: buildingQueryKeys.getBuilding(buildingId),
    queryFn: async () =>
      mockBuildings.find((building) => building.id === buildingId) ?? null,
    ...options,
  });
}

export function useCreateBuilding(
  options?: UseMutationOptionsWrapper<CreateBuildingRequest, Building>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    // Prepends to the Mock exactly as the prototype's repository did: a fresh
    // Toà nhà has no Phòng yet, and its note doubles as the description.
    mutationFn: async (request: CreateBuildingRequest) => {
      const building: Building = {
        id: `b${mockBuildings.length + 1}`,
        name: request.name,
        address: request.address,
        totalFloors: request.totalFloors,
        utilityCycleDay: request.utilityCycleDay,
        note: request.note,
        description: request.note,
        totalRooms: 0,
        activeContracts: 0,
        availableRooms: 0,
        occupancyRate: 0,
      };
      mockBuildings.unshift(building);
      return building;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: buildingQueryKeys.lists() }),
    ...options,
  });
}
