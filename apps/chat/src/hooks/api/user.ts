import type {
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ChatUserSearchPage } from "@monorepo/api/chat/user-service";
import type {
  ChatChangePasswordParams,
  ChatUpdateUserParams,
  ChatUserInfo,
  ChatUserProfile,
  ChatUserSearchRecord,
} from "@monorepo/types/chat-user";
import { toast } from "@monorepo/ui/components/toast";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import { chatUserService } from "~/libs/http-client";
import i18n from "~/libs/i18n";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { useAuthStore } from "~/stores/use-auth-store";

const USER_SEARCH_LIMIT = 20;

const userQueryKeyFactory = queryKeysFactory("user");

export const userQueryKeys = {
  ...userQueryKeyFactory,
  current: () => userQueryKeyFactory.detail("me"),
  search: (search: string) => userQueryKeyFactory.list({ search }),
  info: (userId: string) => userQueryKeyFactory.detail(userId),
};

export function useCurrentUserQuery(
  options?: UseQueryOptionsWrapper<ChatUserProfile>,
): UseQueryResult<ChatUserProfile, Error> {
  const token = useAuthStore((state) => state.token);

  return useQuery<ChatUserProfile, Error>({
    queryKey: userQueryKeys.current(),
    // Wrapped in an arrow function rather than passed by reference — a bare
    // `chatUserService.me` loses its `this` the moment TanStack Query calls
    // it back, since `me` is a prototype method (see .agents/rules/tanstack-use-query.md).
    queryFn: () => chatUserService.me(),
    enabled: !!token,
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

/** The direct-conversation info panel's read of "the other person" — the
 * conversation record itself only carries name/avatar/role. */
export function useUserInfoQuery(
  userId: string | undefined,
  options?: UseQueryOptionsWrapper<ChatUserInfo>,
): UseQueryResult<ChatUserInfo, Error> {
  return useQuery<ChatUserInfo, Error>({
    queryKey: userQueryKeys.info(userId ?? ""),
    queryFn: () => chatUserService.info(userId as string),
    enabled: !!userId,
    ...options,
  });
}

export function useUpdateProfileMutation(
  options?: UseMutationOptionsWrapper<ChatUpdateUserParams, ChatUserProfile>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatUpdateUserParams) =>
      chatUserService.updateMe(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(userQueryKeys.current(), profile);
      toast.add({
        title: i18n.t("chat.profile.toast.updated"),
        type: "success",
      });
    },
    ...options,
  });
}

// No cache write and no sign-out — a password change doesn't touch the
// stored session token, so nothing else needs to react to it.
export function useChangePasswordMutation(
  options?: UseMutationOptionsWrapper<ChatChangePasswordParams, void>,
) {
  return useMutation({
    mutationFn: (payload: ChatChangePasswordParams) =>
      chatUserService.changePassword(payload),
    onSuccess: () => {
      toast.add({
        title: i18n.t("chat.profile.changePassword.toast.success"),
        type: "success",
      });
    },
    ...options,
  });
}
