import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  SupplierBill,
  SupplierBillListParams,
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
