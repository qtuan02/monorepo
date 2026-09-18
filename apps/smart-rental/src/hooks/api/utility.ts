import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  MeterInputRoom,
  Utility,
  UtilityListParams,
  UtilityType,
} from "~/types/utility";
import { mockRooms } from "~/constants/mock/rooms";
import { mockUtilities } from "~/constants/mock/utilities";
import { invoiceQueryKeys } from "~/hooks/api/invoice";
import { taskQueryKeys } from "~/hooks/api/task";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildMeterInputRooms } from "~/utils/meter-input-rooms";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock, the Building scope as a query param.
const utilityQueryKeyFactory = queryKeysFactory("utility");

export const utilityQueryKeys = {
  ...utilityQueryKeyFactory,
  getUtilities: (params?: UtilityListParams) =>
    utilityQueryKeyFactory.list(params),
  getUtility: (utilityId: string) => utilityQueryKeyFactory.detail(utilityId),
  meterInputRooms: (buildingId: string, month: string) =>
    utilityQueryKeyFactory.list({
      kind: "meter-input-rooms",
      buildingId,
      month,
    }),
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

/** The "Nhập chỉ số" rows for one Toà nhà + kỳ — `buildMeterInputRooms` off the live Mock. */
export function useGetMeterInputRooms(
  buildingId: string | null,
  month: string,
  options?: UseQueryOptionsWrapper<MeterInputRoom[]>,
): UseQueryResult<MeterInputRoom[], Error> {
  return useQuery<MeterInputRoom[], Error>({
    queryKey: utilityQueryKeys.meterInputRooms(buildingId ?? "", month),
    queryFn: async () =>
      buildMeterInputRooms(buildingId ?? "", month, mockRooms, mockUtilities),
    enabled: !!buildingId,
    ...options,
  });
}

export interface MeterReadingEntry {
  roomId: string;
  roomName: string;
  type: UtilityType;
  oldIndex: number;
  newIndex: number;
  consumption: number;
}

export interface ConfirmMeterReadingsRequest {
  buildingId: string;
  month: string;
  entries: MeterReadingEntry[];
}

/**
 * "Lưu n chỉ số" — the one save action on "Nhập chỉ số" (spec #153 §10 row
 * 27): upserts every entered reading as `FINALIZED` (a blocked, unapproved
 * anomaly never reaches here — the template gates the button). Invalidates
 * `task` too, so a fixed anomaly drops off Hôm nay's queue immediately, and
 * `invoice` because Đợt hoá đơn's own eligibility (`buildBatchInvoiceRows`)
 * reads these very readings — without this a cached "Chưa đủ điều kiện" row
 * would outlive the reading that just made it eligible.
 */
export function useConfirmMeterReadings(
  options?: UseMutationOptionsWrapper<ConfirmMeterReadingsRequest, Utility[]>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ConfirmMeterReadingsRequest) => {
      const saved: Utility[] = [];
      const updatedAt = new Date().toISOString();

      for (const entry of request.entries) {
        const existing = mockUtilities.find(
          (utility) =>
            utility.roomId === entry.roomId &&
            utility.type === entry.type &&
            utility.month === request.month,
        );
        if (existing) {
          existing.oldIndex = entry.oldIndex;
          existing.newIndex = entry.newIndex;
          existing.consumption = entry.consumption;
          existing.status = "FINALIZED";
          existing.updatedAt = updatedAt;
          saved.push(existing);
        } else {
          const created: Utility = {
            id: `util-${request.month.replace("-", "")}-${entry.roomId}-${entry.type === "electricity" ? "d" : "n"}`,
            buildingId: request.buildingId,
            roomId: entry.roomId,
            roomName: entry.roomName,
            month: request.month,
            type: entry.type,
            oldIndex: entry.oldIndex,
            newIndex: entry.newIndex,
            consumption: entry.consumption,
            status: "FINALIZED",
            updatedAt,
            proofImages: [],
          };
          mockUtilities.push(created);
          saved.push(created);
        }
      }

      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: utilityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      // No existing invoice's detail depends on a Chỉ số reading — only the
      // Đợt hoá đơn preview list does, so `lists()` is enough (see
      // tanstack-key-factory.md's own "invalidate lists() … not all").
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
    },
    ...options,
  });
}
