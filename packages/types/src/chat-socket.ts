import type { ChatConversationRecord } from "./chat-conversation";
import type { ChatMessageRecord } from "./chat-message";

/**
 * `eventType` values `chat-socket` sends across every socket destination. A
 * value outside this set (e.g. the backend's retired `group.deleted`) is
 * simply not one of these — the type guards in `~/libs/socket.ts` treat it
 * like any other unrecognized payload and ignore it.
 *
 * `CONVERSATION_UPDATED`'s own payload shape is changing too (it will carry
 * the whole `conversation` record instead of four loose fields — contract
 * §5), but that rewrite lands together with the `~/libs/socket.ts` guard and
 * the `~/hooks/api/conversation.ts` cache upsert that read it, in T1b
 * (#255) — changing the shape here alone, with nothing left to consume it,
 * would just break that guard's compile for no reason before its own
 * ticket touches it.
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

export interface ChatConversationUpdatedEvent {
  eventType: typeof ChatSocketEventType.CONVERSATION_UPDATED;
  conversationId: string;
  lastMessage: ChatMessageRecord | null;
  lastMessageAt: string;
  unreadCount: number;
}

/** The new shape T1b's guard rewrite switches `CONVERSATION_UPDATED` to —
 * exported ahead of that ticket so it has a type ready to consume. */
export interface ChatConversationRecordUpdatedEvent {
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
