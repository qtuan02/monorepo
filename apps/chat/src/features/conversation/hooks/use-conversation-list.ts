import { useMemo } from "react";

import { ChatConversationType } from "@monorepo/types/chat-conversation";

import type { ConversationListFilter } from "~/features/conversation/types/conversation";
import { mapConversationToUiModel } from "~/features/conversation/utils/map-conversation-to-ui-model";
import { useConversationsInfiniteQuery } from "~/hooks/api/conversation";
import { useCurrentUserQuery } from "~/hooks/api/user";

/** Newest activity first; a conversation with no messages yet sorts last. */
function byLatestActivity(
  a: { lastMessageAt: string | null },
  b: { lastMessageAt: string | null },
): number {
  if (!a.lastMessageAt) return b.lastMessageAt ? 1 : 0;
  if (!b.lastMessageAt) return -1;
  return b.lastMessageAt.localeCompare(a.lastMessageAt);
}

/**
 * Shared by the sidebar list and the panel header (which looks its active
 * conversation's title/avatar up here) — one query, cached and deduped by
 * TanStack Query, mounted from either or both at once.
 *
 * `filter` only ever changes which server query backs it: "groups" asks for
 * `type: GROUP` (its own cache entry, see hooks/api/conversation.ts);
 * "unread" and "all" both read the default list — narrowing to unread is
 * `filter-conversations.ts`'s job, over the full set this hook returns.
 */
export function useConversationList(filter: ConversationListFilter = "all") {
  const currentUserQuery = useCurrentUserQuery();
  const conversationsQuery = useConversationsInfiniteQuery(
    filter === "groups" ? ChatConversationType.GROUP : undefined,
  );
  const currentUserId = currentUserQuery.data?.id;

  const conversations = useMemo(() => {
    if (!currentUserId) return [];
    return (conversationsQuery.data ?? [])
      .map((record) => mapConversationToUiModel(record, currentUserId))
      .sort(byLatestActivity);
  }, [conversationsQuery.data, currentUserId]);

  return {
    conversations,
    isLoading: conversationsQuery.isLoading || currentUserQuery.isLoading,
    isError: conversationsQuery.isError,
    hasNextPage: conversationsQuery.hasNextPage,
    isFetchingNextPage: conversationsQuery.isFetchingNextPage,
    fetchNextPage: conversationsQuery.fetchNextPage,
    refetch: conversationsQuery.refetch,
  };
}
