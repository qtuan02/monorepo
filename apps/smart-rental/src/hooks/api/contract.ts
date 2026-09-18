import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  Contract,
  ContractListParams,
  CreateContractRequest,
  LiquidateContractRequest,
  RenewContractRequest,
} from "~/types/contract";
import { mockContracts } from "~/constants/mock/contracts";
import { mockRooms } from "~/constants/mock/rooms";
import { mockTenants } from "~/constants/mock/tenants";
import { queryKeysFactory } from "~/libs/query-key-factory";
import {
  canDeleteContract,
  deriveContractStatus,
  isContractLive,
} from "~/utils/contract-status";
import { formatDate } from "~/utils/date";

/** `EXPIRING`/`EXPIRED` are never trusted from the Mock (ADR-0012) — recomputed on every read. */
function withDerivedStatus(contract: Contract): Contract {
  return { ...contract, status: deriveContractStatus(contract) };
}

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock. Wiring `be-motel` later is swapping those lines for a
// service singleton from `~/libs/http-client`.
const contractQueryKeyFactory = queryKeysFactory("contract");

export const contractQueryKeys = {
  ...contractQueryKeyFactory,
  getContracts: (params?: ContractListParams) =>
    contractQueryKeyFactory.list(params),
  getContract: (contractId: string) =>
    contractQueryKeyFactory.detail(contractId),
};

export function useGetContracts(
  params?: ContractListParams,
  options?: UseQueryOptionsWrapper<Contract[]>,
): UseQueryResult<Contract[], Error> {
  return useQuery<Contract[], Error>({
    queryKey: contractQueryKeys.getContracts(params),
    queryFn: async () =>
      mockContracts
        .filter(
          (contract) =>
            !params?.buildingId || contract.buildingId === params.buildingId,
        )
        .map(withDerivedStatus),
    ...options,
  });
}

export function useGetContract(
  contractId: string,
  options?: UseQueryOptionsWrapper<Contract | null>,
): UseQueryResult<Contract | null, Error> {
  return useQuery<Contract | null, Error>({
    queryKey: contractQueryKeys.getContract(contractId),
    // A copy: Gia hạn and Thanh lý rewrite the Mock entry in place, and a
    // cached reference would make the old and new detail the same object.
    queryFn: async () => {
      const contract = mockContracts.find((item) => item.id === contractId);
      return contract ? withDerivedStatus(contract) : null;
    },
    ...options,
  });
}

export function useCreateContract(
  options?: UseMutationOptionsWrapper<CreateContractRequest, Contract>,
) {
  return useMutation({
    mutationFn: async (request: CreateContractRequest) => {
      const room = mockRooms.find((item) => item.id === request.roomId);
      if (!room) {
        throw new HttpError({
          statusCode: 404,
          message: `Không có phòng nào với mã ${request.roomId}.`,
        });
      }
      const tenant = mockTenants.find((item) => item.id === request.tenantId);
      if (!tenant) {
        throw new HttpError({
          statusCode: 404,
          message: `Không có người thuê nào với mã ${request.tenantId}.`,
        });
      }
      const nextNumber = String(mockContracts.length + 1).padStart(3, "0");
      const contract: Contract = {
        id: `C${nextNumber}`,
        contractNumber: `HĐ-${nextNumber}`,
        buildingId: room.buildingId,
        roomId: request.roomId,
        tenantId: request.tenantId,
        tenant: tenant.name,
        room: room.name,
        floor: room.floor,
        rentAmount: request.rentAmount,
        depositAmount: request.depositAmount,
        depositStatus: "HELD",
        depositReturnedAmount: 0,
        noticeDays: request.noticeDays,
        startDate: formatDate(request.startDate),
        endDate: formatDate(request.endDate),
        status: "ACTIVE",
        renewalHistory: [],
        lastUpdated: formatDate(new Date()),
      };
      mockContracts.unshift(contract);
      // The Phòng this Hợp đồng covers is no longer trống — the wizard's own
      // step 1 only offered "available" rooms, and a lease starts them occupied.
      room.status = "occupied";
      return contract;
    },
    ...options,
  });
}

/**
 * Rewrites one Mock entry and returns it. An unknown id throws, so the
 * mutation fails and the global `MutationCache.onError` toasts it, rather
 * than a screen toasting success over nothing.
 */
function updateMockContract(
  contractId: string,
  patch: Partial<Contract>,
): Contract {
  const contract = mockContracts.find((item) => item.id === contractId);
  if (!contract) {
    throw new HttpError({
      statusCode: 404,
      message: `Không có hợp đồng nào với mã ${contractId}.`,
    });
  }
  Object.assign(contract, patch, { lastUpdated: formatDate(new Date()) });
  return contract;
}

export function useRenewContract(
  options?: UseMutationOptionsWrapper<RenewContractRequest, Contract>,
) {
  return useMutation({
    mutationFn: async (request: RenewContractRequest) => {
      const contract = mockContracts.find(
        (item) => item.id === request.contractId,
      );
      if (!contract) {
        throw new HttpError({
          statusCode: 404,
          message: `Không có hợp đồng nào với mã ${request.contractId}.`,
        });
      }
      // Gia hạn chỉ từ Đang hiệu lực/Sắp hết hạn (spec #153) — an EXPIRED or
      // TERMINATED Hợp đồng may not be revived through this mutation either,
      // even if a stale screen still posts to it.
      if (!isContractLive(contract)) {
        throw new HttpError({
          statusCode: 409,
          message: `Hợp đồng ${contract.contractNumber} đã kết thúc, không thể gia hạn.`,
        });
      }
      return updateMockContract(request.contractId, {
        renewalHistory: [
          ...contract.renewalHistory,
          {
            renewedAt: new Date().toISOString(),
            previousEndDate: contract.endDate,
            newEndDate: formatDate(request.newEndDate),
            previousRentAmount: contract.rentAmount,
            newRentAmount: request.newRentAmount,
            notes: request.notes,
          },
        ],
        endDate: formatDate(request.newEndDate),
        rentAmount: request.newRentAmount,
        status: "ACTIVE",
      });
    },
    ...options,
  });
}

export function useLiquidateContract(
  options?: UseMutationOptionsWrapper<LiquidateContractRequest, Contract>,
) {
  return useMutation({
    mutationFn: async (request: LiquidateContractRequest) => {
      const contract = mockContracts.find(
        (item) => item.id === request.contractId,
      );
      if (!contract) {
        throw new HttpError({
          statusCode: 404,
          message: `Không có hợp đồng nào với mã ${request.contractId}.`,
        });
      }
      // Thanh lý chỉ từ Đang hiệu lực/Sắp hết hạn (spec #153).
      if (!isContractLive(contract)) {
        throw new HttpError({
          statusCode: 409,
          message: `Hợp đồng ${contract.contractNumber} đã kết thúc, không thể thanh lý.`,
        });
      }
      const room = mockRooms.find((item) => item.id === contract.roomId);
      if (room) room.status = "available";

      return updateMockContract(request.contractId, {
        status: "TERMINATED",
        depositStatus: request.decision,
        depositReturnedAmount: request.returnedAmount,
        terminationReason: request.reason,
        terminatedAt: formatDate(new Date()),
      });
    },
    ...options,
  });
}

export function useDeleteContract(options?: UseMutationOptionsWrapper<string>) {
  return useMutation({
    mutationFn: async (contractId: string) => {
      const index = mockContracts.findIndex((item) => item.id === contractId);
      const contract = mockContracts[index];
      // Defended here too, not only by hiding the button — same predicate.
      if (contract && !canDeleteContract(contract)) {
        throw new HttpError({
          statusCode: 409,
          message: `Hợp đồng ${contract.contractNumber} không phải Nháp, không thể xoá.`,
        });
      }
      if (index !== -1) mockContracts.splice(index, 1);
    },
    ...options,
  });
}
