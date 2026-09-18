import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  CreateSupplierBillRequest,
  SupplierBill,
  SupplierBillListParams,
  UpdateSupplierBillRequest,
} from "~/types/supplier-bill";
import { withBuildingName } from "~/constants/mock/buildings";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { reconciliationQueryKeys } from "~/hooks/api/reconciliation";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock, joined to the Toà nhà Mock for its name.
const supplierBillQueryKeyFactory = queryKeysFactory("supplierBill");

export const supplierBillQueryKeys = {
  ...supplierBillQueryKeyFactory,
  getSupplierBills: (params?: SupplierBillListParams) =>
    supplierBillQueryKeyFactory.list(params),
  getSupplierBill: (billId: string) =>
    supplierBillQueryKeyFactory.detail(billId),
};

export function useGetSupplierBills(
  params?: SupplierBillListParams,
  options?: UseQueryOptionsWrapper<SupplierBill[]>,
): UseQueryResult<SupplierBill[], Error> {
  return useQuery<SupplierBill[], Error>({
    queryKey: supplierBillQueryKeys.getSupplierBills(params),
    // The Building scope is a query param, as it will be on the backend.
    queryFn: async () =>
      mockSupplierBills
        .filter(
          (bill) =>
            !params?.buildingId || bill.buildingId === params.buildingId,
        )
        .map(withBuildingName),
    ...options,
  });
}

export function useGetSupplierBill(
  billId: string,
  options?: UseQueryOptionsWrapper<SupplierBill | null>,
): UseQueryResult<SupplierBill | null, Error> {
  return useQuery<SupplierBill | null, Error>({
    queryKey: supplierBillQueryKeys.getSupplierBill(billId),
    queryFn: async () => {
      const record = mockSupplierBills.find((bill) => bill.id === billId);
      return record ? withBuildingName(record) : null;
    },
    ...options,
  });
}

export function useCreateSupplierBill(
  options?: UseMutationOptionsWrapper<CreateSupplierBillRequest, SupplierBill>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateSupplierBillRequest) => {
      const bill = {
        id: `sb-${mockSupplierBills.length + 1}`,
        ...request,
      };
      mockSupplierBills.push(bill);
      return withBuildingName(bill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: supplierBillQueryKeys.lists(),
      });
      // Đối soát folds a Hoá đơn nhà cung cấp into its điện/nước/dịch vụ line
      // (spec #153 §10 row 11) — a new one must land there without a reload.
      queryClient.invalidateQueries({ queryKey: reconciliationQueryKeys.all });
    },
    ...options,
  });
}

export function useUpdateSupplierBill(
  options?: UseMutationOptionsWrapper<UpdateSupplierBillRequest, SupplierBill>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, ...patch }: UpdateSupplierBillRequest) => {
      const bill = mockSupplierBills.find((item) => item.id === billId);
      if (!bill) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy hoá đơn nhà cung cấp ${billId}.`,
        });
      }
      Object.assign(bill, patch);
      return withBuildingName(bill);
    },
    onSuccess: (bill) => {
      queryClient.invalidateQueries({
        queryKey: supplierBillQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: supplierBillQueryKeys.getSupplierBill(bill.id),
      });
      queryClient.invalidateQueries({ queryKey: reconciliationQueryKeys.all });
    },
    ...options,
  });
}

export function useDeleteSupplierBill(
  options?: UseMutationOptionsWrapper<string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const index = mockSupplierBills.findIndex((bill) => bill.id === billId);
      if (index !== -1) mockSupplierBills.splice(index, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierBillQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: reconciliationQueryKeys.all });
    },
    ...options,
  });
}
