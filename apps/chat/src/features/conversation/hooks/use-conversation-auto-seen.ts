import { useEffect } from "react";

import { useMarkConversationAsSeenMutation } from "~/hooks/api/conversation";

/**
 * Opening a conversation that has unread messages marks it seen — the half
 * of read receipts `ChatSocketProvider` does not cover (that one only fires
 * when a new message lands while the conversation is already on screen).
 * Without it the row stays bold with its badge after a click, and the other
 * side never gets "Seen" for messages read by opening the thread.
 *
 * Keyed on primitives, not the `Conversation` object: the mutation's own
 * `onSuccess` (and the `conversation.seen` echo) zero `unreadCount` in the
 * cache, which is what stops it re-firing.
 */
export function useConversationAutoSeen(
  conversationId: string | undefined,
  unreadCount: number,
) {
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();

  useEffect(() => {
    if (!conversationId || unreadCount === 0) return;
    markConversationAsSeen(conversationId);
  }, [conversationId, unreadCount, markConversationAsSeen]);
}
