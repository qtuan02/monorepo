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
  ChatFriendActionPayload,
  ChatFriendRecord,
  ChatFriendRequestsPayload,
  ChatFriendRequestUser,
  ChatFriendSendRequestPayload,
} from "@monorepo/types/chat-friend";
import { toast } from "@monorepo/ui/components/toast";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import { userQueryKeys } from "~/hooks/api/user";
import { chatFriendService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

const FRIEND_LIST_LIMIT = 50;

const friendQueryKeyFactory = queryKeysFactory("friend");
const friendRequestQueryKeyFactory = queryKeysFactory("friend-request");

export const friendQueryKeys = {
  ...friendQueryKeyFactory,
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
    queryKey: friendQueryKeys.list(),
    queryFn: ({ pageParam }) =>
      chatFriendService.list({ limit: FRIEND_LIST_LIMIT, offset: pageParam }),
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
      toast.add({ title: "Friend request sent.", type: "success" });
    },
    ...options,
  });
}

export function useAcceptFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    ChatFriendActionPayload,
    ChatFriendRequestUser
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatFriendActionPayload) =>
      chatFriendService.accept(payload),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({ title: "Friend request accepted.", type: "success" });
    },
    ...options,
  });
}

export function useDeclineFriendRequestMutation(
  options?: UseMutationOptionsWrapper<ChatFriendActionPayload, string | null>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatFriendActionPayload) =>
      chatFriendService.decline(payload),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({ title: "Friend request declined.", type: "success" });
    },
    ...options,
  });
}

export function useCancelFriendRequestMutation(
  options?: UseMutationOptionsWrapper<ChatFriendActionPayload, string | null>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatFriendActionPayload) =>
      chatFriendService.cancel(payload),
    onSuccess: () => {
      invalidateFriendData(queryClient);
      toast.add({ title: "Friend request cancelled.", type: "success" });
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
      toast.add({ title: "Friend removed.", type: "success" });
    },
    ...options,
  });
}
