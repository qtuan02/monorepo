import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  ReconciliationItem,
  ReconciliationListParams,
} from "~/types/reconciliation";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { buildReconciliationItems } from "~/utils/reconciliation-items";

// `~/constants/mock/reconciliation` was dropped (ADR-0012) — Đối soát is
// computed from Hoá đơn + Hoá đơn nhà cung cấp + Chi phí by `buildReconciliationItems`.
const reconciliationQueryKeyFactory = queryKeysFactory("reconciliation");

export const reconciliationQueryKeys = {
  ...reconciliationQueryKeyFactory,
  getReconciliationItems: (params: ReconciliationListParams) =>
    reconciliationQueryKeyFactory.list(params),
};

export function useGetReconciliationItems(
  params: ReconciliationListParams,
  options?: UseQueryOptionsWrapper<ReconciliationItem[]>,
): UseQueryResult<ReconciliationItem[], Error> {
  return useQuery<ReconciliationItem[], Error>({
    queryKey: reconciliationQueryKeys.getReconciliationItems(params),
    // No Building scope selected → one Toà nhà worth of items per Toà nhà,
    // never merged into one — spec #153 §10 row 11 ("mỗi Toà nhà một khối").
    // `readWorld`'s own `buildings` is already that exact set (one, or
    // every); `buildReconciliationItems` owns the per-Toà-nhà loop itself.
    queryFn: async () =>
      buildReconciliationItems(
        readWorld(params.buildingId ?? null),
        params.period,
      ),
    ...options,
  });
}
