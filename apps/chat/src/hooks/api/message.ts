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
  ChatSendDirectMessageParams,
  ChatSendGroupMessageParams,
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
 * Prepends a live message onto the newest-fetched page (`pages[0]`), never
 * pushes: `pages[0].items` is itself newest-first (see the `select` above),
 * so putting the new message at `items[0]` is what makes it land last once
 * `useMessagesInfiniteQuery` re-orders it to chronological. Prepending there
 * also leaves `olderMessageCount` (computed from `pages.slice(1)`)
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

      const alreadyPresent = data.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );
      if (alreadyPresent) return data;

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
// ~/libs/query-client.ts already surfaces every failed mutation once, and
// there's no socket to patch the cache directly yet, so a sent message
// shows up through invalidation alone (spec #195, ticket #200).

export function useSendDirectMessageMutation(
  options?: UseMutationOptionsWrapper<
    ChatSendDirectMessageParams,
    ChatMessageRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ChatSendDirectMessageParams) =>
      chatMessageService.sendDirect(params),
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.byConversation(message.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
    },
    ...options,
  });
}

export function useSendGroupMessageMutation(
  options?: UseMutationOptionsWrapper<
    ChatSendGroupMessageParams,
    ChatMessageRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ChatSendGroupMessageParams) =>
      chatMessageService.sendGroup(params),
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: messageQueryKeys.byConversation(message.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
    },
    ...options,
  });
}
