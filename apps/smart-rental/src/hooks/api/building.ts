import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  Building,
  CreateBuildingRequest,
  UpdateBuildingSettingsRequest,
} from "~/types/building";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockRooms } from "~/constants/mock/rooms";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { canDeleteBuilding } from "~/utils/building-delete";

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
    // A copy, so the cache never holds the Mock array itself.
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
  return useMutation({
    // Prepends to the Mock exactly as the prototype's repository did: a fresh
    // Toà nhà has no Phòng yet, and its note doubles as the description.
    mutationFn: async (request: CreateBuildingRequest) => {
      const building: Building = {
        id: `b${mockBuildings.length + 1}`,
        name: request.name,
        address: request.address,
        totalFloors: request.totalFloors,
        // The create form has no Bảng giá / Tài khoản nhận tiền step — a fresh
        // Toà nhà gets the workspace default price list and no bank account,
        // both editable afterwards from the detail screen's Cài đặt tab.
        collectionDay: request.collectionDay,
        priceList: {
          electricityPricePerKwh: 3500,
          waterPricePerM3: 15000,
          serviceFee: 100000,
        },
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
    ...options,
  });
}

export function useUpdateBuildingSettings(
  options?: UseMutationOptionsWrapper<UpdateBuildingSettingsRequest, Building>,
) {
  return useMutation({
    mutationFn: async (request: UpdateBuildingSettingsRequest) => {
      const building = mockBuildings.find((b) => b.id === request.buildingId);
      if (!building) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy toà nhà ${request.buildingId}.`,
        });
      }
      building.collectionDay = request.collectionDay;
      building.priceList = request.priceList;
      building.bankAccount = request.bankAccount;
      return building;
    },
    ...options,
  });
}

export function useDeleteBuilding(options?: UseMutationOptionsWrapper<string>) {
  return useMutation({
    // Guarded twice: the template disables the action already, and the
    // mutation re-checks here so a stale button can never bypass it.
    mutationFn: async (buildingId: string) => {
      if (!canDeleteBuilding(buildingId, mockContracts)) {
        throw new HttpError({
          statusCode: 409,
          message: "Không thể xoá: toà nhà còn phòng có hợp đồng hiệu lực.",
        });
      }
      const index = mockBuildings.findIndex((b) => b.id === buildingId);
      if (index !== -1) mockBuildings.splice(index, 1);
      for (let i = mockRooms.length - 1; i >= 0; i -= 1) {
        if (mockRooms[i]?.buildingId === buildingId) mockRooms.splice(i, 1);
      }
    },
    ...options,
  });
}
