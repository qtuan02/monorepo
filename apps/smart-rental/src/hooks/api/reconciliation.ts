import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  ReconciliationItem,
  ReconciliationListParams,
} from "~/types/reconciliation";
import { queryKeysFactory } from "~/libs/query-key-factory";

// `~/constants/mock/reconciliation` was dropped (ADR-0012) — Đối soát is
// computed from Hoá đơn + Hoá đơn nhà cung cấp + Chi phí, a later ticket's
// job. Until then this answers empty, so the screen's own empty state shows.
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
    queryFn: async () => [],
    ...options,
  });
}
