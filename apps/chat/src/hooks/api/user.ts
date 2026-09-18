import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { ChatUserSearchPage } from "@monorepo/api/chat/user-service";
import type {
  ChatUserProfile,
  ChatUserSearchRecord,
} from "@monorepo/types/chat-user";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import { chatUserService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { useAuthStore } from "~/stores/use-auth-store";

const USER_SEARCH_LIMIT = 20;

const userQueryKeyFactory = queryKeysFactory("user");

export const userQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
  search: (search: string) => userQueryKeyFactory.list({ search }),
};

export function useCurrentUserQuery(
  options?: UseQueryOptionsWrapper<ChatUserProfile>,
) {
  const token = useAuthStore((state) => state.token);

  return useQuery<ChatUserProfile, Error>({
    queryKey: userQueryKeys.current(),
    // Wrapped in an arrow function rather than passed by reference — a bare
    // `chatUserService.me` loses its `this` the moment TanStack Query calls
    // it back, since `me` is a prototype method (see .agents/rules/tanstack-use-query.md).
    queryFn: () => chatUserService.me(),
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  });
}

/**
 * The debounce itself is the caller's job (see .agents/rules/patterns-
 * debounce-search-input.md) — this hook only turns a search string into a
 * paginated result, disabled while it's empty so no request fires before
 * the visitor has typed anything.
 */
export function useUserSearchInfiniteQuery(
  search: string,
  options?: UseInfiniteQueryOptionsWrapper<
    ChatUserSearchPage,
    Error,
    ChatUserSearchRecord[],
    readonly unknown[],
    number | undefined
  >,
): UseInfiniteQueryResult<ChatUserSearchRecord[], Error> {
  return useInfiniteQuery<
    ChatUserSearchPage,
    Error,
    ChatUserSearchRecord[],
    readonly unknown[],
    number | undefined
  >({
    queryKey: userQueryKeys.search(search),
    queryFn: ({ pageParam }) =>
      chatUserService.search({
        search,
        limit: USER_SEARCH_LIMIT,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: undefined,
    enabled: search.trim().length > 0,
    // Flattened here, not by the caller — see .agents/rules/tanstack-consume-infinite.md.
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}
