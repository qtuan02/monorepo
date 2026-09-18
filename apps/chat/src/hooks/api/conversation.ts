import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import type { ChatConversationPage } from "@monorepo/api/chat/conversation-service";
import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";

import type { UseInfiniteQueryOptionsWrapper } from "~/libs/query-key-factory";
import { chatConversationService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

const CONVERSATIONS_PAGE_LIMIT = 20;

const conversationQueryKeyFactory = queryKeysFactory("conversation");

export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
};

export function useConversationsInfiniteQuery(
  options?: UseInfiniteQueryOptionsWrapper<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >,
): UseInfiniteQueryResult<ChatConversationRecord[], Error> {
  return useInfiniteQuery<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(),
    queryFn: ({ pageParam }) =>
      chatConversationService.getConversations({
        limit: CONVERSATIONS_PAGE_LIMIT,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    // Flattened here, not by the caller — see .agents/rules/tanstack-consume-infinite.md.
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}
