import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { OverdueDebt, ProfitLossSummary, ReportRow } from "~/types/report";
import { queryKeysFactory } from "~/libs/query-key-factory";

// `~/constants/mock/reports` was dropped (ADR-0012) — Báo cáo is computed
// from Hoá đơn + Hoá đơn nhà cung cấp + Chi phí by Building scope and kỳ, a
// later ticket's job. Until then every read answers empty/zeroed, so
// "Báo cáo" shows its own empty states rather than the prototype's fixed rows.
const reportQueryKeyFactory = queryKeysFactory("report");

export const reportQueryKeys = {
  ...reportQueryKeyFactory,
  getReportRows: () => reportQueryKeyFactory.list(),
  getProfitLossSummary: () => reportQueryKeyFactory.detail("profit-loss"),
  getOverdueDebts: () => reportQueryKeyFactory.detail("overdue-debts"),
};

export function useGetReportRows(
  options?: UseQueryOptionsWrapper<ReportRow[]>,
): UseQueryResult<ReportRow[], Error> {
  return useQuery<ReportRow[], Error>({
    queryKey: reportQueryKeys.getReportRows(),
    queryFn: async () => [],
    ...options,
  });
}

export function useGetProfitLossSummary(
  options?: UseQueryOptionsWrapper<ProfitLossSummary>,
): UseQueryResult<ProfitLossSummary, Error> {
  return useQuery<ProfitLossSummary, Error>({
    queryKey: reportQueryKeys.getProfitLossSummary(),
    queryFn: async () => ({
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      avgOccupancy: 0,
    }),
    ...options,
  });
}

export function useGetOverdueDebts(
  options?: UseQueryOptionsWrapper<OverdueDebt[]>,
): UseQueryResult<OverdueDebt[], Error> {
  return useQuery<OverdueDebt[], Error>({
    queryKey: reportQueryKeys.getOverdueDebts(),
    queryFn: async () => [],
    ...options,
  });
}
