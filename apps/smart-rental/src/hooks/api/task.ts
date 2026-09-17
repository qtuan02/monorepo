import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Task } from "~/types/task";
import { queryKeysFactory } from "~/libs/query-key-factory";

// `~/constants/mock/tasks` was dropped (ADR-0012) — Việc cần làm is derived
// from five sources (Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất
// thường, Thông báo lưu trú chưa gửi, kỳ chưa lập Đợt), a later ticket's job.
// Until then this answers empty, so "Trung tâm nhiệm vụ" shows its own empty
// state rather than the prototype's four sample rows.
const taskQueryKeyFactory = queryKeysFactory("task");

export const taskQueryKeys = {
  ...taskQueryKeyFactory,
  getTasks: () => taskQueryKeyFactory.list(),
};

export function useGetTasks(
  options?: UseQueryOptionsWrapper<Task[]>,
): UseQueryResult<Task[], Error> {
  return useQuery<Task[], Error>({
    queryKey: taskQueryKeys.getTasks(),
    queryFn: async () => [],
    ...options,
  });
}
