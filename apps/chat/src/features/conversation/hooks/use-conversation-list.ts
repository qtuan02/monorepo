import { useMemo } from "react";

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
 */
export function useConversationList() {
  const currentUserQuery = useCurrentUserQuery();
  const conversationsQuery = useConversationsInfiniteQuery();
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
  };
}
