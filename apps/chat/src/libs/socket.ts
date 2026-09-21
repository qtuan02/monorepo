import type { Client, IMessage } from "@stomp/stompjs";

import type {
  ChatConversationParticipant,
  ChatConversationRecord,
} from "@monorepo/types/chat-conversation";
import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import type {
  ChatConversationRemovedEvent,
  ChatConversationSeenEvent,
  ChatConversationSocketEvent,
  ChatConversationUpdatedEvent,
  ChatMessageEvent,
  ChatTypingEvent,
} from "@monorepo/types/chat-socket";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import { isRecord } from "~/utils/is-record";

/**
 * Pure STOMP wiring: type guards over `unknown` wire payloads, plus
 * `subscribeTo*` functions that take an already-connected `Client`. No React,
 * no `~/stores`, no `~/features` — `~/stores/use-socket-store.ts` is the only
 * thing that owns a `Client`, so nothing here can reach for one, and nothing
 * here is bound to a particular subtree (see
 * .agents/rules/architecture-circular-dependencies.md).
 */

const SOCKET_DESTINATIONS = {
  onlineUsersSnapshot: "/app/online-users",
  onlineUsersBroadcast: "/topic/online-users",
  conversationUpdates: "/user/queue/conversations",
  conversationMessages: (conversationId: string) =>
    `/topic/conversations/${conversationId}/messages`,
  conversationTyping: (conversationId: string) =>
    `/topic/conversations/${conversationId}/typing`,
  sendTyping: (conversationId: string) =>
    `/app/conversations/${conversationId}/typing`,
} as const;

function parseJsonMessage<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

const MESSAGE_TYPES = new Set<string>(Object.values(ChatMessageType));

export function isChatMessagePayload(
  value: unknown,
): value is ChatMessageRecord {
  if (!isRecord(value)) return false;

  const hasValidAttachmentUrl =
    value.attachmentUrl === undefined ||
    value.attachmentUrl === null ||
    typeof value.attachmentUrl === "string";

  return (
    typeof value.id === "string" &&
    typeof value.conversationId === "string" &&
    typeof value.senderId === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.type === "string" &&
    MESSAGE_TYPES.has(value.type) &&
    hasValidAttachmentUrl
  );
}

const CONVERSATION_TYPES = new Set<string>(Object.values(ChatConversationType));
const PARTICIPANT_ROLES = new Set<string>(Object.values(ChatParticipantRole));

function isChatConversationParticipant(
  value: unknown,
): value is ChatConversationParticipant {
  if (!isRecord(value)) return false;

  const hasValidAvatarUrl =
    value.avatarUrl === undefined ||
    value.avatarUrl === null ||
    typeof value.avatarUrl === "string";
  const hasValidLastReadMessageId =
    value.lastReadMessageId === undefined ||
    value.lastReadMessageId === null ||
    typeof value.lastReadMessageId === "string";
  const hasValidLastReadAt =
    value.lastReadAt === undefined ||
    value.lastReadAt === null ||
    typeof value.lastReadAt === "string";

  return (
    typeof value.userId === "string" &&
    typeof value.username === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string" &&
    typeof value.role === "string" &&
    PARTICIPANT_ROLES.has(value.role) &&
    hasValidAvatarUrl &&
    hasValidLastReadMessageId &&
    hasValidLastReadAt
  );
}

/** Reused by `isChatConversationUpdatedEvent` — the socket now carries the
 * whole `ChatConversationRecord` on `conversation.updated` (contract §5). */
function isChatConversationRecord(
  value: unknown,
): value is ChatConversationRecord {
  if (!isRecord(value)) return false;

  const hasValidLastMessage =
    value.lastMessage === null || isChatMessagePayload(value.lastMessage);

  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    CONVERSATION_TYPES.has(value.type) &&
    (value.groupName === null || typeof value.groupName === "string") &&
    hasValidLastMessage &&
    (value.lastMessageAt === null || typeof value.lastMessageAt === "string") &&
    typeof value.unreadCount === "number" &&
    Number.isFinite(value.unreadCount) &&
    Array.isArray(value.participants) &&
    value.participants.every(isChatConversationParticipant)
  );
}

export function isChatConversationUpdatedEvent(
  value: unknown,
): value is ChatConversationUpdatedEvent {
  if (!isRecord(value)) return false;

  return (
    value.eventType === ChatSocketEventType.CONVERSATION_UPDATED &&
    isChatConversationRecord(value.conversation)
  );
}

export function isChatConversationRemovedEvent(
  value: unknown,
): value is ChatConversationRemovedEvent {
  if (!isRecord(value)) return false;

  return (
    value.eventType === ChatSocketEventType.CONVERSATION_REMOVED &&
    typeof value.conversationId === "string"
  );
}

export function isChatConversationSeenEvent(
  value: unknown,
): value is ChatConversationSeenEvent {
  if (!isRecord(value)) return false;

  return (
    value.eventType === ChatSocketEventType.CONVERSATION_SEEN &&
    typeof value.conversationId === "string" &&
    typeof value.seenByUserId === "string" &&
    typeof value.lastReadMessageId === "string" &&
    typeof value.lastReadAt === "string"
  );
}

export function isChatConversationSocketEvent(
  value: unknown,
): value is ChatConversationSocketEvent {
  return (
    isChatConversationUpdatedEvent(value) ||
    isChatConversationRemovedEvent(value) ||
    isChatConversationSeenEvent(value)
  );
}

const MESSAGE_EVENT_TYPES = new Set<string>([
  ChatSocketEventType.MESSAGE_CREATED,
  ChatSocketEventType.MESSAGE_UPDATED,
  ChatSocketEventType.MESSAGE_DELETED,
]);

export function isChatMessageEvent(value: unknown): value is ChatMessageEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.eventType === "string" &&
    MESSAGE_EVENT_TYPES.has(value.eventType) &&
    isChatMessagePayload(value.message)
  );
}

export function isChatTypingEvent(value: unknown): value is ChatTypingEvent {
  if (!isRecord(value)) return false;

  return (
    value.eventType === ChatSocketEventType.TYPING &&
    typeof value.conversationId === "string" &&
    typeof value.userId === "string"
  );
}

function sanitizeOnlineUserIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const uniqueUserIds = new Set<string>();
  for (const userId of value) {
    if (typeof userId === "string") uniqueUserIds.add(userId);
  }

  return [...uniqueUserIds];
}

/** Unsubscribe callback every `subscribeTo*` below returns. */
type Unsubscribe = () => void;

/**
 * `/app/online-users` is a `@SubscribeMapping` (a one-shot reply on
 * subscribe, not a stream) and `/topic/online-users` is the ongoing
 * broadcast — both carry the same `string[]` snapshot shape, so one handler
 * serves both.
 */
export function subscribeToOnlineUsers(
  client: Client,
  onOnlineUsers: (onlineUserIds: string[]) => void,
): Unsubscribe {
  const handleMessage = (message: IMessage) => {
    const onlineUserIds = sanitizeOnlineUserIds(
      parseJsonMessage<unknown>(message.body),
    );
    if (onlineUserIds) onOnlineUsers(onlineUserIds);
  };

  const snapshotSubscription = client.subscribe(
    SOCKET_DESTINATIONS.onlineUsersSnapshot,
    handleMessage,
  );
  const broadcastSubscription = client.subscribe(
    SOCKET_DESTINATIONS.onlineUsersBroadcast,
    handleMessage,
  );

  return () => {
    snapshotSubscription.unsubscribe();
    broadcastSubscription.unsubscribe();
  };
}

export function subscribeToConversationUpdates(
  client: Client,
  onEvent: (event: ChatConversationSocketEvent) => void,
): Unsubscribe {
  const subscription = client.subscribe(
    SOCKET_DESTINATIONS.conversationUpdates,
    (message: IMessage) => {
      const payload = parseJsonMessage<unknown>(message.body);
      if (!isChatConversationSocketEvent(payload)) return;
      onEvent(payload);
    },
  );

  return () => subscription.unsubscribe();
}

export function subscribeToConversationMessages(
  client: Client,
  conversationId: string,
  onEvent: (event: ChatMessageEvent) => void,
): Unsubscribe {
  const subscription = client.subscribe(
    SOCKET_DESTINATIONS.conversationMessages(conversationId),
    (message: IMessage) => {
      const payload = parseJsonMessage<unknown>(message.body);
      if (!isChatMessageEvent(payload)) return;
      if (payload.message.conversationId !== conversationId) return;
      onEvent(payload);
    },
  );

  return () => subscription.unsubscribe();
}

/**
 * `/topic/conversations/{id}/typing` — active-participant-only, same as
 * `/messages` (contract §5). One event per keystroke from every OTHER
 * typing participant; the caller (T4) debounces it into a ~3s "still
 * typing" window per userId.
 */
export function subscribeToTyping(
  client: Client,
  conversationId: string,
  onTyping: (event: ChatTypingEvent) => void,
): Unsubscribe {
  const subscription = client.subscribe(
    SOCKET_DESTINATIONS.conversationTyping(conversationId),
    (message: IMessage) => {
      const payload = parseJsonMessage<unknown>(message.body);
      if (!isChatTypingEvent(payload)) return;
      if (payload.conversationId !== conversationId) return;
      onTyping(payload);
    },
  );

  return () => subscription.unsubscribe();
}

/** `SEND /app/conversations/{id}/typing` — no body, so there is nothing to
 * guard on the way out. Throttling the calls is the caller's job (T4). */
export function sendTyping(client: Client, conversationId: string): void {
  client.publish({
    destination: SOCKET_DESTINATIONS.sendTyping(conversationId),
  });
}
