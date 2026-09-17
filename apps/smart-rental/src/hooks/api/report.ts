import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { OverdueDebt, ProfitLossSummary, ReportRow } from "~/types/report";
import type { TenantView } from "~/types/tenant";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";
import {
  buildOverdueDebts,
  buildProfitLossSummary,
  buildReportRows,
} from "~/utils/report-rows";
import { toTenantView } from "~/utils/tenant-status";

// `~/constants/mock/reports` was dropped (ADR-0012) — Báo cáo is computed
// from Hoá đơn + Chi phí + Chỉ số by `~/utils/report-rows`.
const reportQueryKeyFactory = queryKeysFactory("report");

export const reportQueryKeys = {
  ...reportQueryKeyFactory,
  getReportRows: () => reportQueryKeyFactory.list(),
  getProfitLossSummary: () => reportQueryKeyFactory.detail("profit-loss"),
  getOverdueDebts: () => reportQueryKeyFactory.detail("overdue-debts"),
};

function buildTenantViews(): TenantView[] {
  return mockTenants.map((tenant) =>
    toTenantView(tenant, mockContracts, mockInvoices),
  );
}

function getRows(): ReportRow[] {
  return buildReportRows({
    buildings: mockBuildings,
    rooms: mockRooms,
    invoices: mockInvoices,
    expenses: mockExpenses,
    utilities: mockUtilities,
    tenantViews: buildTenantViews(),
  });
}

export function useGetReportRows(
  options?: UseQueryOptionsWrapper<ReportRow[]>,
): UseQueryResult<ReportRow[], Error> {
  return useQuery<ReportRow[], Error>({
    queryKey: reportQueryKeys.getReportRows(),
    queryFn: async () => getRows(),
    ...options,
  });
}

export function useGetProfitLossSummary(
  options?: UseQueryOptionsWrapper<ProfitLossSummary>,
): UseQueryResult<ProfitLossSummary, Error> {
  return useQuery<ProfitLossSummary, Error>({
    queryKey: reportQueryKeys.getProfitLossSummary(),
    queryFn: async () => buildProfitLossSummary(getRows()),
    ...options,
  });
}

export function useGetOverdueDebts(
  options?: UseQueryOptionsWrapper<OverdueDebt[]>,
): UseQueryResult<OverdueDebt[], Error> {
  return useQuery<OverdueDebt[], Error>({
    queryKey: reportQueryKeys.getOverdueDebts(),
    queryFn: async () => buildOverdueDebts(mockInvoices),
    ...options,
  });
}
