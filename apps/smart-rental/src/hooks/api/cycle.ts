import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { CycleRow } from "~/types/cycle";
import type { Invoice } from "~/types/invoice";
import type { UtilityType } from "~/types/utility";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockUtilities } from "~/constants/mock/utilities";
import { mockUtilityOldIndexOverrides } from "~/constants/mock/utility-old-index-overrides";
import { invoiceQueryKeys } from "~/hooks/api/invoice";
import { reconciliationQueryKeys } from "~/hooks/api/reconciliation";
import { taskQueryKeys } from "~/hooks/api/task";
import { utilityQueryKeys } from "~/hooks/api/utility";
import { queryKeysFactory } from "~/libs/query-key-factory";
import {
  buildCycleDueDate,
  buildCycleLineItems,
  buildCycleRows,
} from "~/utils/cycle-rows";
import { formatDate, formatMonth } from "~/utils/date";

const cycleQueryKeyFactory = queryKeysFactory("cycle");

export const cycleQueryKeys = {
  ...cycleQueryKeyFactory,
  getCycleRows: (buildingId: string, month: string) =>
    cycleQueryKeyFactory.list({ buildingId, month }),
};

/** `buildCycleRows` off the live Mock — the one seam `useGetCycleRows` and `useCreateCycleInvoices` both read through. */
function resolveCycleRows(buildingId: string, month: string): CycleRow[] {
  const building = mockBuildings.find((item) => item.id === buildingId);
  if (!building) return [];
  return buildCycleRows(
    buildingId,
    month,
    mockRooms,
    mockContracts,
    mockUtilities,
    mockInvoices,
    building.priceList,
    undefined,
    mockUtilityOldIndexOverrides,
  );
}

/** "Kỳ điện nước & hoá đơn"'s one table — `buildCycleRows` off the live Mock (ADR-0013). */
export function useGetCycleRows(
  buildingId: string | null,
  month: string,
  options?: UseQueryOptionsWrapper<CycleRow[]>,
): UseQueryResult<CycleRow[], Error> {
  return useQuery<CycleRow[], Error>({
    queryKey: cycleQueryKeys.getCycleRows(buildingId ?? "", month),
    queryFn: async () => resolveCycleRows(buildingId ?? "", month),
    enabled: !!buildingId,
    ...options,
  });
}

interface CycleReadingEntry {
  roomId: string;
  roomName: string;
  type: UtilityType;
  oldIndex: number;
  newIndex: number;
  consumption: number;
}

export interface SaveCycleReadingsRequest {
  buildingId: string;
  month: string;
  entries: CycleReadingEntry[];
}

/**
 * "Lưu nháp chỉ số" — upserts every entered reading as `DRAFT` (ADR-0013:
 * `FINALIZED` only happens at "Lập n hoá đơn", never here). Invalidates
 * `utility`/`task` too, so a fixed anomaly or a newly-eligible row shows up
 * on the very next read.
 */
export function useSaveCycleReadings(
  options?: UseMutationOptionsWrapper<SaveCycleReadingsRequest, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SaveCycleReadingsRequest) => {
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
          existing.status = "DRAFT";
          // A re-entered reading needs re-approving — the number that was
          // duyệt-ed no longer is.
          existing.approved = false;
          existing.updatedAt = updatedAt;
        } else {
          mockUtilities.push({
            id: `util-${request.month.replace("-", "")}-${entry.roomId}-${entry.type === "electricity" ? "d" : "n"}`,
            buildingId: request.buildingId,
            roomId: entry.roomId,
            roomName: entry.roomName,
            month: request.month,
            type: entry.type,
            oldIndex: entry.oldIndex,
            newIndex: entry.newIndex,
            consumption: entry.consumption,
            status: "DRAFT",
            approved: false,
            updatedAt,
            proofImages: [],
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: utilityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}

export interface CreateCycleInvoicesRequest {
  buildingId: string;
  /** `YYYY-MM`. */
  month: string;
}

/**
 * "Lập n hoá đơn" — the one write that closes a Kỳ (ADR-0013): a Hoá đơn per
 * `READY` Phòng (dòng tiền phòng + điện/nước × Bảng giá + dịch vụ cố định,
 * hạn thu = ngày thu của Toà nhà tháng sau), and its two Chỉ số của kỳ move
 * to `FINALIZED`. Re-derives `buildCycleRows` at write time too, so a row
 * that went stale (already invoiced, or turned anomalous) since the last
 * read can't be double-billed.
 */
export function useCreateCycleInvoices(
  options?: UseMutationOptionsWrapper<CreateCycleInvoicesRequest, Invoice[]>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCycleInvoicesRequest) => {
      const building = mockBuildings.find(
        (item) => item.id === request.buildingId,
      );
      if (!building) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy toà nhà ${request.buildingId}.`,
        });
      }

      const readyRows = resolveCycleRows(
        request.buildingId,
        request.month,
      ).filter((row) => row.status === "READY");

      const finalizedAt = new Date().toISOString();
      const created: Invoice[] = [];

      for (const row of readyRows) {
        if (!row.contractId) continue;
        const contract = mockContracts.find(
          (item) => item.id === row.contractId,
        );
        if (!contract) continue;

        const lineItems = buildCycleLineItems(
          contract,
          building,
          row.electricityConsumption ?? 0,
          row.waterConsumption ?? 0,
          request.month,
        );
        const amount = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const sequence = mockInvoices.length + 1;
        const invoice: Invoice = {
          id: `I${String(sequence).padStart(3, "0")}`,
          buildingId: request.buildingId,
          contractId: contract.id,
          invoiceNumber: `HÓA-${String(sequence).padStart(3, "0")}`,
          tenant: contract.tenant,
          room: contract.room,
          floor: contract.floor,
          amount,
          lineItems,
          payments: [],
          paidAmount: 0,
          reminders: [],
          billingMonth: request.month,
          month: formatMonth(request.month),
          dueDate: buildCycleDueDate(building, request.month),
          status: "UNPAID",
          paymentDate: null,
          lastUpdated: formatDate(new Date()),
        };
        mockInvoices.push(invoice);
        created.push(invoice);

        for (const utility of mockUtilities) {
          if (
            utility.roomId === row.roomId &&
            utility.month === request.month
          ) {
            utility.status = "FINALIZED";
            utility.updatedAt = finalizedAt;
          }
        }
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: utilityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      // New lineItems change the thu side of Đối soát for this kỳ — mirrors
      // the invalidation expense.ts/supplier-bill.ts already do on their writes.
      queryClient.invalidateQueries({ queryKey: reconciliationQueryKeys.all });
    },
    ...options,
  });
}

export interface ApproveCycleReadingRequest {
  roomId: string;
  type: UtilityType;
  /** `YYYY-MM`. */
  month: string;
}

/** "Duyệt điện" / "Duyệt nước" — one đồng hồ at a time (ticket #183, ADR-0013). */
export function useApproveCycleReading(
  options?: UseMutationOptionsWrapper<ApproveCycleReadingRequest, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ApproveCycleReadingRequest) => {
      const reading = mockUtilities.find(
        (utility) =>
          utility.roomId === request.roomId &&
          utility.type === request.type &&
          utility.month === request.month,
      );
      if (!reading) {
        throw new HttpError({
          statusCode: 404,
          message: "Không tìm thấy chỉ số cần duyệt.",
        });
      }
      reading.approved = true;
      reading.updatedAt = new Date().toISOString();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: utilityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}

export interface CorrectCycleOldIndexRequest {
  roomId: string;
  type: UtilityType;
  /** `YYYY-MM`. */
  month: string;
  oldIndex: number;
  note: string;
}

/**
 * "Sửa chỉ số cũ" — thay công tơ mid-kỳ (ticket #183, ADR-0013). Upserts a
 * correction rather than editing a past kỳ's own reading, so only THIS kỳ's
 * baseline changes.
 */
export function useCorrectCycleOldIndex(
  options?: UseMutationOptionsWrapper<CorrectCycleOldIndexRequest, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CorrectCycleOldIndexRequest) => {
      const existing = mockUtilityOldIndexOverrides.find(
        (item) =>
          item.roomId === request.roomId &&
          item.type === request.type &&
          item.month === request.month,
      );
      const updatedAt = new Date().toISOString();

      if (existing) {
        existing.oldIndex = request.oldIndex;
        existing.note = request.note;
        existing.updatedAt = updatedAt;
      } else {
        mockUtilityOldIndexOverrides.push({
          id: `override-${request.month.replace("-", "")}-${request.roomId}-${request.type === "electricity" ? "d" : "n"}`,
          roomId: request.roomId,
          type: request.type,
          month: request.month,
          oldIndex: request.oldIndex,
          note: request.note,
          updatedAt,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleQueryKeys.all });
      // A corrected chỉ số cũ can turn a MISSING/ANOMALY row eligible, which
      // can affect Việc cần làm's "chưa lập Đợt" — mirrors the invalidation
      // useApproveCycleReading already does above.
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}
