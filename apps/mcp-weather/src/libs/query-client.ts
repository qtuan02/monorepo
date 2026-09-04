import {
  isServer,
  keepPreviousData,
  MutationCache,
  QueryClient,
} from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";
import { toast } from "@monorepo/ui/components/toast";

/**
 * A fresh client per call. In an SPA one module-level instance is correct; on a
 * Next server it is not — the module is shared by every request, so one visitor's
 * cache would be served to the next. `getQueryClient` below is what decides.
 */
export function makeQueryClient() {
  return new QueryClient({
    // Global mutation-error handler: every failed mutation is surfaced once
    // here. Give a mutation its own `onError` only for extra recovery (rollback,
    // focus) — never to re-toast.
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.add({
          title:
            error instanceof HttpError
              ? error.message
              : "Đã có lỗi xảy ra, vui lòng thử lại.",
          type: "error",
        });
      },
    }),
    defaultOptions: {
      queries: {
        // Non-zero on purpose: with SSR a zero `staleTime` refetches every query
        // on the client the instant it hydrates, throwing away the server's work.
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client for the whole browser session, a throwaway one per server render.
 *
 * The browser branch cannot be a plain module singleton created at import time:
 * React may suspend during the first render, and a client created in module
 * scope would then be replaced on the retry, dropping everything already
 * fetched.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
}
