import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import { chatHealthService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

const healthQueryKeyFactory = queryKeysFactory("health");

export const healthQueryKeys = {
  ...healthQueryKeyFactory,
  check: () => healthQueryKeyFactory.detail("check"),
};

/**
 * Retries every 2s until the backend answers — that retry, not a one-shot
 * fetch, is what a Health gate is for.
 */
export function useBackendHealthQuery(
  options?: UseQueryOptionsWrapper<boolean>,
) {
  return useQuery({
    queryKey: healthQueryKeys.check(),
    // TanStack Query rejects `undefined` as query data, so the resolved
    // `void` of `check()` is turned into a real value here.
    queryFn: async () => {
      await chatHealthService.check();
      return true;
    },
    retry: true,
    retryDelay: 2000,
    staleTime: 30 * 1000,
    ...options,
  });
}
