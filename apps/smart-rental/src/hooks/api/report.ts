import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  BuildingComparisonRow,
  FloorOccupancy,
  ProfitLossSummary,
  ReportRow,
} from "~/types/report";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";
import {
  buildBuildingComparisonRows,
  buildFloorOccupancy,
  buildProfitLossSummary,
  buildReportRows,
} from "~/utils/report-rows";

// `~/constants/mock/reports` was dropped (ADR-0012) — Báo cáo is computed off
// `readWorld` (ADR-0015) by `~/utils/report-rows`.
const reportQueryKeyFactory = queryKeysFactory("report");

export const reportQueryKeys = {
  ...reportQueryKeyFactory,
  getReportRows: (buildingId?: string | null) =>
    reportQueryKeyFactory.list({ buildingId }),
  getProfitLossSummary: (buildingId?: string | null) =>
    reportQueryKeyFactory.detail("profit-loss", { buildingId }),
  getFloorOccupancy: (buildingId?: string | null) =>
    reportQueryKeyFactory.detail("floor-occupancy", { buildingId }),
  getBuildingComparison: () =>
    reportQueryKeyFactory.detail("building-comparison"),
};

interface ReportParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export function useGetReportRows(
  params?: ReportParams,
  options?: UseQueryOptionsWrapper<ReportRow[]>,
): UseQueryResult<ReportRow[], Error> {
  return useQuery<ReportRow[], Error>({
    queryKey: reportQueryKeys.getReportRows(params?.buildingId),
    queryFn: async () => buildReportRows(readWorld(params?.buildingId ?? null)),
    ...options,
  });
}

export function useGetProfitLossSummary(
  params?: ReportParams,
  options?: UseQueryOptionsWrapper<ProfitLossSummary>,
): UseQueryResult<ProfitLossSummary, Error> {
  return useQuery<ProfitLossSummary, Error>({
    queryKey: reportQueryKeys.getProfitLossSummary(params?.buildingId),
    queryFn: async () =>
      buildProfitLossSummary(
        buildReportRows(readWorld(params?.buildingId ?? null)),
      ),
    ...options,
  });
}

/** "Lấp đầy theo tầng" — one Toà nhà scope only (spec #153 §10 row 29). */
export function useGetFloorOccupancy(
  params: ReportParams,
  options?: UseQueryOptionsWrapper<FloorOccupancy[]>,
): UseQueryResult<FloorOccupancy[], Error> {
  return useQuery<FloorOccupancy[], Error>({
    queryKey: reportQueryKeys.getFloorOccupancy(params.buildingId),
    queryFn: async () =>
      params.buildingId
        ? buildFloorOccupancy(readWorld(params.buildingId).rooms)
        : [],
    ...options,
  });
}

/** "Bảng so sánh giữa các Toà nhà" — scope `null` only (spec #153 §10 row 29). */
export function useGetBuildingComparison(
  options?: UseQueryOptionsWrapper<BuildingComparisonRow[]>,
): UseQueryResult<BuildingComparisonRow[], Error> {
  return useQuery<BuildingComparisonRow[], Error>({
    queryKey: reportQueryKeys.getBuildingComparison(),
    queryFn: async () =>
      buildBuildingComparisonRows(buildReportRows(readWorld(null))),
    ...options,
  });
}
