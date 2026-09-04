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
