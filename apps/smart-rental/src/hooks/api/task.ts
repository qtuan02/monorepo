import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Task, TaskListParams } from "~/types/task";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { deriveTasks } from "~/utils/task-derivation";

// `~/constants/mock/tasks` was dropped (ADR-0012) — Việc cần làm is derived
// from five sources (Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất
// thường, Thông báo lưu trú chưa gửi, kỳ chưa lập Đợt) by `deriveTasks`.
const taskQueryKeyFactory = queryKeysFactory("task");

export const taskQueryKeys = {
  ...taskQueryKeyFactory,
  getTasks: (params?: TaskListParams) => taskQueryKeyFactory.list(params),
};

export function useGetTasks(
  params?: TaskListParams,
  options?: UseQueryOptionsWrapper<Task[]>,
): UseQueryResult<Task[], Error> {
  return useQuery<Task[], Error>({
    queryKey: taskQueryKeys.getTasks(params),
    queryFn: async () =>
      deriveTasks({
        contracts: mockContracts,
        invoices: mockInvoices,
        utilities: mockUtilities,
        tenants: mockTenants,
        complianceItems: mockComplianceItems,
        buildings: mockBuildings,
        buildingId: params?.buildingId,
      }),
    ...options,
  });
}
