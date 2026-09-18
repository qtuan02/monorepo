import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { SendLog } from "~/types/communication";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

const sendLogQueryKeyFactory = queryKeysFactory("sendLog");

export const sendLogQueryKeys = {
  ...sendLogQueryKeyFactory,
  getSendLogs: () => sendLogQueryKeyFactory.list(),
};

export function useGetSendLogs(
  options?: UseQueryOptionsWrapper<SendLog[]>,
): UseQueryResult<SendLog[], Error> {
  return useQuery<SendLog[], Error>({
    queryKey: sendLogQueryKeys.getSendLogs(),
    queryFn: async () => readWorld(null).sendLogs,
    ...options,
  });
}
