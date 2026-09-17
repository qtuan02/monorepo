import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { OverdueDebt, ProfitLossSummary, ReportRow } from "~/types/report";
import {
  mockOverdueDebts,
  mockProfitLossSummary,
  mockReportRows,
} from "~/constants/mock/reports";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The prototype collapsed the three reads into one `Promise.all` query; here
// each is its own query so the screen fetches them in parallel and a refetch
// of one does not re-run the others (patterns-parallel-fetching.md).
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
    queryFn: async () => [...mockReportRows],
    ...options,
  });
}

export function useGetProfitLossSummary(
  options?: UseQueryOptionsWrapper<ProfitLossSummary>,
): UseQueryResult<ProfitLossSummary, Error> {
  return useQuery<ProfitLossSummary, Error>({
    queryKey: reportQueryKeys.getProfitLossSummary(),
    queryFn: async () => ({ ...mockProfitLossSummary }),
    ...options,
  });
}

export function useGetOverdueDebts(
  options?: UseQueryOptionsWrapper<OverdueDebt[]>,
): UseQueryResult<OverdueDebt[], Error> {
  return useQuery<OverdueDebt[], Error>({
    queryKey: reportQueryKeys.getOverdueDebts(),
    queryFn: async () => [...mockOverdueDebts],
    ...options,
  });
}
