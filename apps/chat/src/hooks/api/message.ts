import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import type { ChatMessagePage } from "@monorepo/api/chat/message-service";
import type { ChatMessageRecord } from "@monorepo/types/chat-message";

import type { UseInfiniteQueryOptionsWrapper } from "~/libs/query-key-factory";
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
