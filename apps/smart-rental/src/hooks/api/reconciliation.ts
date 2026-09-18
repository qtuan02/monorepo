import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  ReconciliationItem,
  ReconciliationListParams,
} from "~/types/reconciliation";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
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
    // `buildReconciliationItems` itself only ever scopes to one Toà nhà; the
    // loop over every Toà nhà belongs here, the one place that already holds
    // the Toà nhà Mock.
    queryFn: async () => {
      const buildingIds = params.buildingId
        ? [params.buildingId]
        : mockBuildings.map((building) => building.id);
      return buildingIds.flatMap((buildingId) =>
        buildReconciliationItems(
          mockInvoices,
          mockSupplierBills,
          mockExpenses,
          buildingId,
          params.period,
        ),
      );
    },
    ...options,
  });
}
