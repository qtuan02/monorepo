import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { describe, expect, it, vi } from "vitest";

import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import {
  isChatConversationSeenEvent,
  isChatConversationSocketEvent,
  isChatConversationUpdatedEvent,
  isChatMessagePayload,
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
  subscribeToOnlineUsers,
} from "~/libs/socket";

const VALID_MESSAGE = {
  id: "m1",
  conversationId: "c1",
  senderId: "u2",
  content: "Hi",
  type: ChatMessageType.TEXT,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const VALID_UPDATED_EVENT = {
  eventType: ChatSocketEventType.CONVERSATION_UPDATED,
  conversationId: "c1",
  lastMessage: VALID_MESSAGE,
  lastMessageAt: "2026-09-19T00:00:00.000Z",
  unreadCount: 1,
};

const VALID_SEEN_EVENT = {
  eventType: ChatSocketEventType.CONVERSATION_SEEN,
  conversationId: "c1",
  seenByUserId: "u1",
  lastReadMessageId: "m1",
  lastReadAt: "2026-09-19T00:00:00.000Z",
};

/** A fake `Client` recording one handler per destination, driven by `emit`. */
function createFakeClient() {
  const handlers = new Map<string, (message: IMessage) => void>();

  const client = {
    subscribe: vi.fn(
      (destination: string, handler: (message: IMessage) => void) => {
        handlers.set(destination, handler);
        return { unsubscribe: vi.fn() } satisfies Partial<StompSubscription>;
      },
    ),
  } as unknown as Client;

  function emit(destination: string, body: unknown) {
    handlers.get(destination)?.({ body: JSON.stringify(body) } as IMessage);
  }

  return { client, emit };
}

describe("isChatMessagePayload", () => {
  it("accepts a well-formed message", () => {
    expect(isChatMessagePayload(VALID_MESSAGE)).toBe(true);
  });

  it.each([
    ["not a record", "nope"],
    ["missing a required field", { ...VALID_MESSAGE, senderId: undefined }],
    ["an unknown message type", { ...VALID_MESSAGE, type: "GIF" }],
    ["a non-string attachmentUrl", { ...VALID_MESSAGE, attachmentUrl: 42 }],
  ])("rejects %s", (_label, payload) => {
    expect(isChatMessagePayload(payload)).toBe(false);
  });

  it("accepts a null or missing attachmentUrl", () => {
    expect(
      isChatMessagePayload({ ...VALID_MESSAGE, attachmentUrl: null }),
    ).toBe(true);
  });
});

describe("isChatConversationUpdatedEvent / isChatConversationSeenEvent", () => {
  it("classifies a conversation.updated payload", () => {
    expect(isChatConversationUpdatedEvent(VALID_UPDATED_EVENT)).toBe(true);
    expect(isChatConversationSeenEvent(VALID_UPDATED_EVENT)).toBe(false);
  });

  it("accepts a conversation.updated event with no last message", () => {
    expect(
      isChatConversationUpdatedEvent({
        ...VALID_UPDATED_EVENT,
        lastMessage: null,
      }),
    ).toBe(true);
  });

  it("classifies a conversation.seen payload", () => {
    expect(isChatConversationSeenEvent(VALID_SEEN_EVENT)).toBe(true);
    expect(isChatConversationUpdatedEvent(VALID_SEEN_EVENT)).toBe(false);
  });

  it.each([
    [
      "an unrelated eventType",
      { ...VALID_UPDATED_EVENT, eventType: "group.deleted" },
    ],
    [
      "a numeric unreadCount stringified",
      { ...VALID_UPDATED_EVENT, unreadCount: "1" },
    ],
    ["a garbage payload", { hello: "world" }],
    ["not an object at all", "conversation.updated"],
  ])("isChatConversationSocketEvent rejects %s", (_label, payload) => {
    expect(isChatConversationSocketEvent(payload)).toBe(false);
  });

  it("isChatConversationSocketEvent accepts either event shape", () => {
    expect(isChatConversationSocketEvent(VALID_UPDATED_EVENT)).toBe(true);
    expect(isChatConversationSocketEvent(VALID_SEEN_EVENT)).toBe(true);
  });
});

describe("subscribeToConversationUpdates", () => {
  it("dispatches only a recognized event, and drops an unrelated payload", () => {
    const { client, emit } = createFakeClient();
    const onEvent = vi.fn();

    subscribeToConversationUpdates(client, onEvent);

    emit("/user/queue/conversations", { eventType: "group.deleted" });
    emit("/user/queue/conversations", VALID_UPDATED_EVENT);
    emit("/user/queue/conversations", VALID_SEEN_EVENT);

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenNthCalledWith(1, VALID_UPDATED_EVENT);
    expect(onEvent).toHaveBeenNthCalledWith(2, VALID_SEEN_EVENT);
  });
});

describe("subscribeToConversationMessages", () => {
  it("dispatches a message for its own conversation, ignoring a mismatched one", () => {
    const { client, emit } = createFakeClient();
    const onMessage = vi.fn();

    subscribeToConversationMessages(client, "c1", onMessage);

    emit("/topic/conversations/c1/messages", {
      ...VALID_MESSAGE,
      conversationId: "c2",
    });
    emit("/topic/conversations/c1/messages", VALID_MESSAGE);

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(VALID_MESSAGE);
  });
});

describe("subscribeToOnlineUsers", () => {
  it("sanitizes the snapshot and the broadcast into a deduped string array", () => {
    const { client, emit } = createFakeClient();
    const onOnlineUsers = vi.fn();

    subscribeToOnlineUsers(client, onOnlineUsers);

    emit("/app/online-users", ["u1", "u2", "u1", 42, null]);
    emit("/topic/online-users", "not-an-array");

    expect(onOnlineUsers).toHaveBeenCalledTimes(1);
    expect(onOnlineUsers).toHaveBeenCalledWith(["u1", "u2"]);
  });
});
