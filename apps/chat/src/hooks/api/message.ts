import type {
  InfiniteData,
  QueryClient,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { ChatMessagePage } from "@monorepo/api/chat/message-service";
import type {
  ChatMessageRecord,
  DirectMessageRequest,
  GroupMessageRequest,
} from "@monorepo/types/chat-message";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
} from "~/libs/query-key-factory";
import { conversationQueryKeys } from "~/hooks/api/conversation";
import { chatMessageService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

const MESSAGES_PAGE_LIMIT = 30;

const messageQueryKeyFactory = queryKeysFactory("message");

export const messageQueryKeys = {
  ...messageQueryKeyFactory,
  byConversation: (conversationId: string) =>
    messageQueryKeyFactory.list({ conversationId }),
};

/**
 * A page arrives newest-first (the cursor walks backward in time); Virtuoso
 * renders top-to-bottom. This is the one place that ordering is untangled —
 * see .agents/rules/tanstack-consume-infinite.md, "data is already the flat
 * item array" — so a consumer reads plain oldest-to-newest messages, plus
 * how many of them came from an "older" (not the first-fetched) page, which
 * is what a reverse-infinite-scroll `firstItemIndex` is built from.
 */
export interface MessagesReadModel {
  messages: ChatMessageRecord[];
  olderMessageCount: number;
}

type MessageInfiniteData = InfiniteData<ChatMessagePage, string | undefined>;

/**
 * Upserts a live message by `id`: replaces it in place where it already
 * sits (a `message.updated` echo, or the socket racing a mutation's own
 * response), or prepends it onto the newest-fetched page (`pages[0]`) when
 * it's new. `pages[0].items` is itself newest-first (see the `select`
 * above), so putting a new message at `items[0]` is what makes it land last
 * once `useMessagesInfiniteQuery` re-orders it to chronological. Prepending
 * there also leaves `olderMessageCount` (computed from `pages.slice(1)`)
 * unaffected, so `firstItemIndex` doesn't shift under Virtuoso mid-scroll.
 */
export function appendConversationMessageToCache(
  queryClient: QueryClient,
  message: ChatMessageRecord,
) {
  queryClient.setQueriesData<MessageInfiniteData>(
    { queryKey: messageQueryKeys.byConversation(message.conversationId) },
    (data) => {
      if (!data) return data;

      const isPresent = data.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );

      if (isPresent) {
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === message.id ? message : item,
            ),
          })),
        };
      }

      const [firstPage, ...restPages] = data.pages;
      if (!firstPage) return data;

      return {
        ...data,
        pages: [
          { ...firstPage, items: [message, ...firstPage.items] },
          ...restPages,
        ],
      };
    },
  );
}

/** `message.deleted` — the backend keeps no tombstone, so the row is simply gone. */
export function removeConversationMessageFromCache(
  queryClient: QueryClient,
  message: ChatMessageRecord,
) {
  queryClient.setQueriesData<MessageInfiniteData>(
    { queryKey: messageQueryKeys.byConversation(message.conversationId) },
    (data) => {
      if (!data) return data;

      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== message.id),
        })),
      };
    },
  );
}

export function useMessagesInfiniteQuery(
  conversationId: string,
  options?: UseInfiniteQueryOptionsWrapper<
    ChatMessagePage,
    Error,
    MessagesReadModel,
    readonly unknown[],
    string | undefined
  >,
): UseInfiniteQueryResult<MessagesReadModel, Error> {
  return useInfiniteQuery<
    ChatMessagePage,
    Error,
    MessagesReadModel,
    readonly unknown[],
    string | undefined
  >({
    queryKey: messageQueryKeys.byConversation(conversationId),
    queryFn: ({ pageParam }) =>
      chatMessageService.getMessages(conversationId, {
        limit: MESSAGES_PAGE_LIMIT,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!conversationId && (options?.enabled ?? true),
    select: (data) => {
      const oldestFetchedPageFirst = [...data.pages].reverse();
      return {
        messages: oldestFetchedPageFirst.flatMap((page) =>
          [...page.items].reverse(),
        ),
        olderMessageCount: data.pages
          .slice(1)
          .reduce((count, page) => count + page.items.length, 0),
      };
    },
    ...options,
  });
}

// No `onError` toast in either hook — the global `MutationCache.onError` in
// ~/libs/query-client.ts already surfaces every failed mutation once. The
// sent message is patched in from the response (idempotent with the socket
// echo — `appendConversationMessageToCache` dedupes by id); only the list
// preview is refetched, since a Draft conversation has no row to patch yet.
function applySentMessage(
  queryClient: QueryClient,
  message: ChatMessageRecord,
) {
  appendConversationMessageToCache(queryClient, message);
  queryClient.invalidateQueries({ queryKey: conversationQueryKeys.lists() });
}

export function useSendDirectMessageMutation(
  options?: UseMutationOptionsWrapper<DirectMessageRequest, ChatMessageRecord>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DirectMessageRequest) =>
      chatMessageService.sendDirect(params),
    onSuccess: (message) => applySentMessage(queryClient, message),
    ...options,
  });
}

export function useSendGroupMessageMutation(
  options?: UseMutationOptionsWrapper<GroupMessageRequest, ChatMessageRecord>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GroupMessageRequest) =>
      chatMessageService.sendGroup(params),
    onSuccess: (message) => applySentMessage(queryClient, message),
    ...options,
  });
}
