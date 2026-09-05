import {
  keepPreviousData,
  MutationCache,
  QueryClient,
} from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";
import { toast } from "@monorepo/ui/components/toast";

/**
 * A fresh client per call — a factory, never the module-level singleton the Vite
 * Template exports. One Node process server-renders every visitor at once, so a
 * shared client would put one visitor's cached data in the next visitor's HTML;
 * the same reasoning that keeps this app's i18next instance a per-request clone.
 *
 * `root.tsx`'s `Layout` calls it once through `useState`, which is what makes it
 * "one client per render tree" rather than one per render: on the server the
 * tree is the request, and in the browser the tree lives as long as the tab, so
 * a navigation reuses the cache the way it should. `useState` also survives
 * React re-running the first render after a suspend, which a client created in
 * module scope would not.
 */
export function getQueryClient(): QueryClient {
  return new QueryClient({
    // Global mutation-error handler: every failed mutation is surfaced once
    // here. Give a mutation its own `onError` only for extra recovery (rollback,
    // focus) — never to re-toast. Writes that belong to a route (`sign-in`,
    // `sign-out`) are `action`s and never reach this cache; everything else goes
    // through `~/hooks/api` and does.
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
        // the instant the page hydrates, throwing away work the server already
        // did for any query that was prefetched.
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
