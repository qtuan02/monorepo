import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type {
  BuildingComparisonRow,
  FloorOccupancy,
  ProfitLossSummary,
  ReportRow,
} from "~/types/report";
import type { TenantView } from "~/types/tenant";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";
import {
  buildBuildingComparisonRows,
  buildFloorOccupancy,
  buildProfitLossSummary,
  buildReportRows,
} from "~/utils/report-rows";
import { toTenantView } from "~/utils/tenant-status";

// `~/constants/mock/reports` was dropped (ADR-0012) — Báo cáo is computed
// from Hoá đơn + Hoá đơn NCC + Chi phí + Chỉ số by `~/utils/report-rows`.
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

function buildTenantViews(): TenantView[] {
  return mockTenants.map((tenant) =>
    toTenantView(tenant, mockContracts, mockInvoices),
  );
}

function getRows(buildingId: string | null | undefined): ReportRow[] {
  return buildReportRows({
    buildings: mockBuildings,
    rooms: mockRooms,
    invoices: mockInvoices,
    expenses: mockExpenses,
    supplierBills: mockSupplierBills,
    utilities: mockUtilities,
    tenantViews: buildTenantViews(),
    buildingId,
  });
}

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
    queryFn: async () => getRows(params?.buildingId),
    ...options,
  });
}

export function useGetProfitLossSummary(
  params?: ReportParams,
  options?: UseQueryOptionsWrapper<ProfitLossSummary>,
): UseQueryResult<ProfitLossSummary, Error> {
  return useQuery<ProfitLossSummary, Error>({
    queryKey: reportQueryKeys.getProfitLossSummary(params?.buildingId),
    queryFn: async () => buildProfitLossSummary(getRows(params?.buildingId)),
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
      buildFloorOccupancy(
        params.buildingId
          ? mockRooms.filter((room) => room.buildingId === params.buildingId)
          : [],
      ),
    ...options,
  });
}

/** "Bảng so sánh giữa các Toà nhà" — scope `null` only (spec #153 §10 row 29). */
export function useGetBuildingComparison(
  options?: UseQueryOptionsWrapper<BuildingComparisonRow[]>,
): UseQueryResult<BuildingComparisonRow[], Error> {
  return useQuery<BuildingComparisonRow[], Error>({
    queryKey: reportQueryKeys.getBuildingComparison(),
    queryFn: async () => buildBuildingComparisonRows(getRows(null)),
    ...options,
  });
}
