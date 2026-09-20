import type { ChatMessageRecord } from "./chat-message";

/**
 * `eventType` values `chat-socket` sends on `/user/queue/conversations`. A
 * value outside this set (e.g. the backend's own `group.deleted`) is simply
 * not one of these two events — the type guards in `~/libs/socket.ts` treat
 * it like any other unrecognized payload and ignore it.
 */
export const ChatSocketEventType = {
  CONVERSATION_UPDATED: "conversation.updated",
  CONVERSATION_SEEN: "conversation.seen",
} as const;

export interface ChatConversationUpdatedEvent {
  eventType: typeof ChatSocketEventType.CONVERSATION_UPDATED;
  conversationId: string;
  lastMessage: ChatMessageRecord | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatConversationSeenEvent {
  eventType: typeof ChatSocketEventType.CONVERSATION_SEEN;
  conversationId: string;
  seenByUserId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}

export type ChatConversationSocketEvent =
  | ChatConversationUpdatedEvent
  | ChatConversationSeenEvent;
