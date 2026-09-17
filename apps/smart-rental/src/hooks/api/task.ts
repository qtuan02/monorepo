import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Task } from "~/types/task";
import { mockTasks } from "~/constants/mock/tasks";
import { queryKeysFactory } from "~/libs/query-key-factory";

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
    queryFn: async () => [...mockTasks],
    ...options,
  });
}
