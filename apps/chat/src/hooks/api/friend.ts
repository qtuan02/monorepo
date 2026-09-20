import type {
  QueryClient,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ChatFriendPage } from "@monorepo/api/chat/friend-service";
import type {
  ChatFriendRecord,
  ChatFriendRequestsPayload,
  ChatFriendSendRequestPayload,
  UserSummaryDto,
} from "@monorepo/types/chat-friend";
import { toast } from "@monorepo/ui/components/toast";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import { userQueryKeys } from "~/hooks/api/user";
import { chatFriendService } from "~/libs/http-client";
import i18n from "~/libs/i18n";
import { queryKeysFactory } from "~/libs/query-key-factory";

const FRIEND_LIST_LIMIT = 50;

const friendQueryKeyFactory = queryKeysFactory("friend");
const friendRequestQueryKeyFactory = queryKeysFactory("friend-request");

export const friendQueryKeys = {
  ...friendQueryKeyFactory,
  search: (search?: string) => friendQueryKeyFactory.list({ search }),
};

export const friendRequestQueryKeys = {
  ...friendRequestQueryKeyFactory,
};

/**
 * Refetches every place a `statusFriend` or a friend list could now be
 * stale — the friend list, the request queues, and any cached search/info
 * result carrying its own `statusFriend`/`requestId`.
 */
function invalidateFriendData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: friendRequestQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
}

export function useFriendsInfiniteQuery(
  search?: string,
  options?: UseInfiniteQueryOptionsWrapper<
    ChatFriendPage,
    Error,
    ChatFriendRecord[],
    readonly unknown[],
    number | undefined
  >,
): UseInfiniteQueryResult<ChatFriendRecord[], Error> {
  return useInfiniteQuery<
    ChatFriendPage,
    Error,
    ChatFriendRecord[],
    readonly unknown[],
    number | undefined
  >({
    queryKey: friendQueryKeys.search(search),
    queryFn: ({ pageParam }) =>
      chatFriendService.list({
        search: search || undefined,
        limit: FRIEND_LIST_LIMIT,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: undefined,
    // Flattened here, not by the caller — see .agents/rules/tanstack-consume-infinite.md.
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}

export function useFriendRequestsQuery(
  options?: UseQueryOptionsWrapper<ChatFriendRequestsPayload>,
): UseQueryResult<ChatFriendRequestsPayload, Error> {
  return useQuery<ChatFriendRequestsPayload, Error>({
    queryKey: friendRequestQueryKeys.all,
    queryFn: () => chatFriendService.requests(),
    ...options,
  });
}

export function useSendFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    ChatFriendSendRequestPayload,
    string | null
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatFriendSendRequestPayload) =>
      chatFriendService.send(payload),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({
        title: i18n.t("chat.friends.toast.requestSent"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useAcceptFriendRequestMutation(
  options?: UseMutationOptionsWrapper<string, UserSummaryDto>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => chatFriendService.accept(requestId),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({
        title: i18n.t("chat.friends.toast.requestAccepted"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useDeclineFriendRequestMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => chatFriendService.decline(requestId),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({
        title: i18n.t("chat.friends.toast.requestDeclined"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useCancelFriendRequestMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => chatFriendService.cancel(requestId),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({
        title: i18n.t("chat.friends.toast.requestCancelled"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useRemoveFriendMutation(
  options?: UseMutationOptionsWrapper<string, string | null>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendId: string) => chatFriendService.remove(friendId),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({
        title: i18n.t("chat.friends.toast.friendRemoved"),
        type: "success",
      });
    },
    ...options,
  });
}
