import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  ReconciliationItem,
  ReconciliationListParams,
} from "~/types/reconciliation";
import { mockReconciliationItems } from "~/constants/mock/reconciliation";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock.
const reconciliationQueryKeyFactory = queryKeysFactory("reconciliation");

export const reconciliationQueryKeys = {
  ...reconciliationQueryKeyFactory,
  getReconciliationItems: (params?: ReconciliationListParams) =>
    reconciliationQueryKeyFactory.list(params),
};

export function useGetReconciliationItems(
  params?: ReconciliationListParams,
  options?: UseQueryOptionsWrapper<ReconciliationItem[]>,
): UseQueryResult<ReconciliationItem[], Error> {
  return useQuery<ReconciliationItem[], Error>({
    queryKey: reconciliationQueryKeys.getReconciliationItems(params),
    // The Building scope is a query param, as it will be on the backend.
    queryFn: async () =>
      mockReconciliationItems.filter(
        (item) => !params?.buildingId || item.buildingId === params.buildingId,
      ),
    ...options,
  });
}
