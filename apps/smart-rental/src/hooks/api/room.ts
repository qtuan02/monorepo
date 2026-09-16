import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { Room, RoomListParams } from "~/types/room";
import { mockRooms } from "~/constants/mock/rooms";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock. Wiring `be-motel` later is swapping those lines for a
// service singleton from `~/libs/http-client`.
const roomQueryKeyFactory = queryKeysFactory("room");

export const roomQueryKeys = {
  ...roomQueryKeyFactory,
  getRooms: (params?: RoomListParams) => roomQueryKeyFactory.list(params),
  getRoom: (roomId: string) => roomQueryKeyFactory.detail(roomId),
};

export function useGetRooms(
  params?: RoomListParams,
  options?: UseQueryOptionsWrapper<Room[]>,
): UseQueryResult<Room[], Error> {
  return useQuery<Room[], Error>({
    queryKey: roomQueryKeys.getRooms(params),
    // The Building scope is a query param, as it will be on the backend —
    // never a filter applied over an unscoped cache entry.
    queryFn: async () =>
      mockRooms.filter(
        (room) => !params?.buildingId || room.buildingId === params.buildingId,
      ),
    ...options,
  });
}

export function useGetRoom(
  roomId: string,
  options?: UseQueryOptionsWrapper<Room | null>,
): UseQueryResult<Room | null, Error> {
  return useQuery<Room | null, Error>({
    queryKey: roomQueryKeys.getRoom(roomId),
    queryFn: async () => mockRooms.find((room) => room.id === roomId) ?? null,
    ...options,
  });
}

export function useDeleteRoom(options?: UseMutationOptionsWrapper<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const index = mockRooms.findIndex((room) => room.id === roomId);
      if (index !== -1) mockRooms.splice(index, 1);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.all }),
    ...options,
  });
}
