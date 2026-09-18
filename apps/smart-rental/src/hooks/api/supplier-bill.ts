import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: async (request: CreateSupplierBillRequest) => {
      const bill = {
        id: `sb-${mockSupplierBills.length + 1}`,
        ...request,
      };
      mockSupplierBills.push(bill);
      return withBuildingName(bill);
    },
    ...options,
  });
}

export function useUpdateSupplierBill(
  options?: UseMutationOptionsWrapper<UpdateSupplierBillRequest, SupplierBill>,
) {
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
    ...options,
  });
}

export function useDeleteSupplierBill(
  options?: UseMutationOptionsWrapper<string>,
) {
  return useMutation({
    mutationFn: async (billId: string) => {
      const index = mockSupplierBills.findIndex((bill) => bill.id === billId);
      if (index !== -1) mockSupplierBills.splice(index, 1);
    },
    ...options,
  });
}
