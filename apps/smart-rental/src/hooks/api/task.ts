import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Task, TaskListParams } from "~/types/task";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { deriveTasks } from "~/utils/task-derivation";

// `~/constants/mock/tasks` was dropped (ADR-0012) — Việc cần làm is derived
// from six sources by `deriveTasks`, off `readWorld` (ADR-0015).
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
    queryFn: async () => deriveTasks(readWorld(params?.buildingId ?? null)),
    ...options,
  });
}
