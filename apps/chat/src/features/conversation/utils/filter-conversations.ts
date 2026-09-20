import type {
  Conversation,
  ConversationListFilter,
} from "~/features/conversation/types/conversation";

interface FilterConversationsOptions {
  search: string;
  filter: ConversationListFilter;
  /**
   * Ids that matched `unread` the moment the visitor entered that filter —
   * kept until they leave it, so opening a conversation (which clears its
   * `unreadCount`) does not make its own row vanish under the cursor (brief
   * §10 row 17).
   */
  keptUnreadIds: ReadonlySet<string>;
}

/** The list's own name filter, applied inside whichever chip is active. */
export function filterConversations(
  conversations: Conversation[],
  { search, filter, keptUnreadIds }: FilterConversationsOptions,
): Conversation[] {
  const term = search.trim().toLowerCase();
  const bySearch = term
    ? conversations.filter((conversation) =>
        conversation.title.toLowerCase().includes(term),
      )
    : conversations;

  if (filter !== "unread") return bySearch;

  return bySearch.filter(
    (conversation) =>
      conversation.unreadCount > 0 || keptUnreadIds.has(conversation.id),
  );
}
