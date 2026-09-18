import {
  keepPreviousData,
  MutationCache,
  QueryClient,
} from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";
import { toast } from "@monorepo/ui/components/toast";

export const queryClient = new QueryClient({
  // Global mutation-error handler: every failed mutation is surfaced once here.
  // Give a mutation its own `onError` only for extra recovery (rollback, focus) —
  // do not re-toast (see .agents/rules/tanstack-consume-mutation.md).
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
    // World read seam (ADR-0015 §3): the Mock is in-memory and ≤100 rows per
    // entity, and every derived read is O(n) over it — invalidating
    // everything after every successful write is cheaper than a static
    // entity→derived-keys table that must be kept in sync by hand every time
    // a screen adds a new derived read. No mutation hook lists a key of its
    // own any more. Narrow this once `be-motel` exists, per endpoint.
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
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
