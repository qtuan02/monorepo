import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import dayjs from "@monorepo/dayjs";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  Contract,
  ContractListParams,
  CreateContractRequest,
  RenewContractRequest,
} from "~/types/contract";
import { mockContracts } from "~/constants/mock/contracts";
import { mockRooms } from "~/constants/mock/rooms";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate } from "~/utils/date";

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
      mockContracts.filter(
        (contract) =>
          !params?.buildingId || contract.buildingId === params.buildingId,
      ),
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
      return contract ? { ...contract } : null;
    },
    ...options,
  });
}

export function useCreateContract(
  options?: UseMutationOptionsWrapper<CreateContractRequest, Contract>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateContractRequest) => {
      const room = mockRooms.find((item) => item.id === request.roomId);
      const start = dayjs(request.startDate);
      const nextNumber = String(mockContracts.length + 1).padStart(3, "0");
      const contract: Contract = {
        id: `C${nextNumber}`,
        contractNumber: `HĐ-${nextNumber}`,
        buildingId: request.buildingId,
        tenant: request.tenantName,
        room: room?.name ?? request.roomId,
        floor: room?.floor ?? 0,
        rentAmount: request.rentAmount,
        depositAmount: request.depositAmount,
        startDate: formatDate(start.toDate()),
        endDate: formatDate(start.add(request.termMonths, "month").toDate()),
        status: "active",
        lastUpdated: formatDate(new Date()),
      };
      mockContracts.unshift(contract);
      return contract;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() }),
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
  if (!contract) throw new Error(`Không có hợp đồng nào với mã ${contractId}.`);
  Object.assign(contract, patch, { lastUpdated: formatDate(new Date()) });
  return contract;
}

export function useRenewContract(
  options?: UseMutationOptionsWrapper<RenewContractRequest, Contract>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RenewContractRequest) =>
      updateMockContract(request.contractId, {
        endDate: formatDate(request.newEndDate),
        rentAmount: request.newRentAmount,
        status: "active",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all }),
    ...options,
  });
}

export function useLiquidateContract(
  options?: UseMutationOptionsWrapper<string, Contract>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) =>
      updateMockContract(contractId, { status: "ended" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all }),
    ...options,
  });
}

export function useDeleteContract(options?: UseMutationOptionsWrapper<string>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      const index = mockContracts.findIndex((item) => item.id === contractId);
      if (index !== -1) mockContracts.splice(index, 1);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.all }),
    ...options,
  });
}
