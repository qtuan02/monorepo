import { useMemo } from "react";

import { useConversationList } from "~/features/conversation/hooks/use-conversation-list";
import { mapMessageToUiModel } from "~/features/conversation/utils/map-message-to-ui-model";
import { useMessagesInfiniteQuery } from "~/hooks/api/message";

// Virtuoso's reverse-infinite-scroll trick: start far above zero and count
// down as older pages are prepended, so newly loaded history never shifts
// the index of a message already on screen.
const FIRST_ITEM_INDEX = 1_000_000;

export function useConversationMessages(conversationId: string) {
  const messagesQuery = useMessagesInfiniteQuery(conversationId);
  const { conversations } = useConversationList();
  const conversation = conversations.find((item) => item.id === conversationId);

  const senderNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of conversation?.members ?? []) {
      map.set(member.userId, member.displayName);
    }
    return map;
  }, [conversation]);

  const records = messagesQuery.data?.messages ?? [];
  const olderMessageCount = messagesQuery.data?.olderMessageCount ?? 0;

  const messages = useMemo(
    () => records.map((record) => mapMessageToUiModel(record, senderNameById)),
    [records, senderNameById],
  );

  return {
    messages,
    members: conversation?.members ?? [],
    type: conversation?.type,
    firstItemIndex: FIRST_ITEM_INDEX - olderMessageCount,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    hasNextPage: messagesQuery.hasNextPage,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
    refetch: messagesQuery.refetch,
  };
}
