import type { Client, IMessage } from "@stomp/stompjs";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import type {
  ChatConversationSeenEvent,
  ChatConversationSocketEvent,
  ChatConversationUpdatedEvent,
} from "@monorepo/types/chat-socket";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

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
} as const;

function parseJsonMessage<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
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

export function isChatConversationUpdatedEvent(
  value: unknown,
): value is ChatConversationUpdatedEvent {
  if (!isRecord(value)) return false;

  const hasValidLastMessage =
    value.lastMessage === null || isChatMessagePayload(value.lastMessage);

  return (
    value.eventType === ChatSocketEventType.CONVERSATION_UPDATED &&
    typeof value.conversationId === "string" &&
    typeof value.lastMessageAt === "string" &&
    typeof value.unreadCount === "number" &&
    Number.isFinite(value.unreadCount) &&
    hasValidLastMessage
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
    isChatConversationUpdatedEvent(value) || isChatConversationSeenEvent(value)
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
  onMessage: (message: ChatMessageRecord) => void,
): Unsubscribe {
  const subscription = client.subscribe(
    SOCKET_DESTINATIONS.conversationMessages(conversationId),
    (message: IMessage) => {
      const payload = parseJsonMessage<unknown>(message.body);
      if (!isChatMessagePayload(payload)) return;
      if (payload.conversationId !== conversationId) return;
      onMessage(payload);
    },
  );

  return () => subscription.unsubscribe();
}
