import type { ChatConversationRecord } from "./chat-conversation";
import type { ChatMessageRecord } from "./chat-message";

/**
 * `eventType` values `chat-socket` sends across every socket destination. A
 * value outside this set (e.g. the backend's retired `group.deleted`) is
 * simply not one of these — the type guards in `~/libs/socket.ts` treat it
 * like any other unrecognized payload and ignore it.
 */
export const ChatSocketEventType = {
  CONVERSATION_UPDATED: "conversation.updated",
  CONVERSATION_REMOVED: "conversation.removed",
  CONVERSATION_SEEN: "conversation.seen",
  MESSAGE_CREATED: "message.created",
  MESSAGE_UPDATED: "message.updated",
  MESSAGE_DELETED: "message.deleted",
  TYPING: "typing",
} as const;

/** Carries the whole record — `~/hooks/api/conversation.ts`'s
 * `applyConversationUpdateToCache` upserts it into the list by `id` rather
 * than patching loose fields (contract §5). */
export interface ChatConversationUpdatedEvent {
  eventType: typeof ChatSocketEventType.CONVERSATION_UPDATED;
  conversation: ChatConversationRecord;
}

export interface ChatConversationRemovedEvent {
  eventType: typeof ChatSocketEventType.CONVERSATION_REMOVED;
  conversationId: string;
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
  | ChatConversationRemovedEvent
  | ChatConversationSeenEvent;

/** `/topic/conversations/{id}/messages` — one shape for all three eventTypes. */
export interface ChatMessageEvent {
  eventType:
    | typeof ChatSocketEventType.MESSAGE_CREATED
    | typeof ChatSocketEventType.MESSAGE_UPDATED
    | typeof ChatSocketEventType.MESSAGE_DELETED;
  message: ChatMessageRecord;
}

/** `/topic/conversations/{id}/typing` — no body on the `SEND` side. */
export interface ChatTypingEvent {
  eventType: typeof ChatSocketEventType.TYPING;
  conversationId: string;
  userId: string;
}
