import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  CreateRoomRequest,
  Room,
  RoomListParams,
  RoomView,
  UpdateRoomRequest,
} from "~/types/room";
import { mockContracts } from "~/constants/mock/contracts";
import { mockRooms } from "~/constants/mock/rooms";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate } from "~/utils/date";
import { canDeleteRoom } from "~/utils/room-delete";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers through `readWorld` (ADR-0015). Wiring `be-motel` later is swapping
// that one line for a service singleton from `~/libs/http-client`.
const roomQueryKeyFactory = queryKeysFactory("room");

export const roomQueryKeys = {
  ...roomQueryKeyFactory,
  getRooms: (params?: RoomListParams) => roomQueryKeyFactory.list(params),
  getRoom: (roomId: string) => roomQueryKeyFactory.detail(roomId),
};

export function useGetRooms(
  params?: RoomListParams,
  options?: UseQueryOptionsWrapper<RoomView[]>,
): UseQueryResult<RoomView[], Error> {
  return useQuery<RoomView[], Error>({
    queryKey: roomQueryKeys.getRooms(params),
    // The Building scope is a query param, as it will be on the backend —
    // never a filter applied over an unscoped cache entry.
    queryFn: async () => readWorld(params?.buildingId ?? null).rooms,
    ...options,
  });
}

export function useGetRoom(
  roomId: string,
  options?: UseQueryOptionsWrapper<RoomView | null>,
): UseQueryResult<RoomView | null, Error> {
  return useQuery<RoomView | null, Error>({
    queryKey: roomQueryKeys.getRoom(roomId),
    queryFn: async () =>
      readWorld(null).rooms.find((room) => room.id === roomId) ?? null,
    ...options,
  });
}

export function useCreateRoom(
  options?: UseMutationOptionsWrapper<CreateRoomRequest, Room>,
) {
  return useMutation({
    mutationFn: async (request: CreateRoomRequest) => {
      const room: Room = {
        id: `R-${request.buildingId}-${String(mockRooms.length + 1).padStart(3, "0")}`,
        ...request,
        lastUpdated: formatDate(new Date()),
      };
      mockRooms.push(room);
      return room;
    },
    ...options,
  });
}

export function useUpdateRoom(
  options?: UseMutationOptionsWrapper<UpdateRoomRequest, Room>,
) {
  return useMutation({
    mutationFn: async ({ roomId, ...patch }: UpdateRoomRequest) => {
      const room = mockRooms.find((item) => item.id === roomId);
      if (!room) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy phòng ${roomId}.`,
        });
      }
      Object.assign(room, patch, { lastUpdated: formatDate(new Date()) });
      return room;
    },
    ...options,
  });
}

export function useDeleteRoom(options?: UseMutationOptionsWrapper<string>) {
  return useMutation({
    // Guarded twice: the template disables the action already, and the
    // mutation re-checks here so a stale button can never bypass it.
    mutationFn: async (roomId: string) => {
      if (!canDeleteRoom(roomId, mockContracts)) {
        throw new HttpError({
          statusCode: 409,
          message: "Không thể xoá: phòng còn hợp đồng hiệu lực.",
        });
      }
      const index = mockRooms.findIndex((room) => room.id === roomId);
      if (index !== -1) mockRooms.splice(index, 1);
    },
    ...options,
  });
}
