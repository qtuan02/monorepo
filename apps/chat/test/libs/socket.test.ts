import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { describe, expect, it, vi } from "vitest";

import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";
import { ChatSocketEventType } from "@monorepo/types/chat-socket";

import {
  isChatConversationRemovedEvent,
  isChatConversationSeenEvent,
  isChatConversationSocketEvent,
  isChatConversationUpdatedEvent,
  isChatMessageEvent,
  isChatMessagePayload,
  isChatTypingEvent,
  sendTyping,
  subscribeToConversationMessages,
  subscribeToConversationUpdates,
  subscribeToOnlineUsers,
  subscribeToTyping,
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

const VALID_PARTICIPANT = {
  userId: "u1",
  username: "alice",
  firstName: "A",
  lastName: "L",
  avatarUrl: null,
  role: ChatParticipantRole.ADMIN,
  lastReadMessageId: null,
  lastReadAt: null,
};

// §5b of api-contract-changes.md.
const VALID_CONVERSATION_RECORD = {
  id: "c1",
  type: ChatConversationType.GROUP,
  groupName: "Team",
  lastMessage: VALID_MESSAGE,
  lastMessageAt: "2026-09-20T10:00:00.123456Z",
  unreadCount: 2,
  participants: [VALID_PARTICIPANT],
};

const VALID_UPDATED_EVENT = {
  eventType: ChatSocketEventType.CONVERSATION_UPDATED,
  conversation: VALID_CONVERSATION_RECORD,
};

const VALID_REMOVED_EVENT = {
  eventType: ChatSocketEventType.CONVERSATION_REMOVED,
  conversationId: "c1",
};

const VALID_SEEN_EVENT = {
  eventType: ChatSocketEventType.CONVERSATION_SEEN,
  conversationId: "c1",
  seenByUserId: "u1",
  lastReadMessageId: "m1",
  lastReadAt: "2026-09-19T00:00:00.000Z",
};

const VALID_MESSAGE_CREATED_EVENT = {
  eventType: ChatSocketEventType.MESSAGE_CREATED,
  message: VALID_MESSAGE,
};

const VALID_TYPING_EVENT = {
  eventType: ChatSocketEventType.TYPING,
  conversationId: "c1",
  userId: "u2",
};

/** A fake `Client` recording one handler per destination, driven by `emit`. */
function createFakeClient() {
  const handlers = new Map<string, (message: IMessage) => void>();
  const publish = vi.fn();

  const client = {
    subscribe: vi.fn(
      (destination: string, handler: (message: IMessage) => void) => {
        handlers.set(destination, handler);
        return { unsubscribe: vi.fn() } satisfies Partial<StompSubscription>;
      },
    ),
    publish,
  } as unknown as Client;

  function emit(destination: string, body: unknown) {
    handlers.get(destination)?.({ body: JSON.stringify(body) } as IMessage);
  }

  return { client, emit, publish };
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

describe("isChatConversationUpdatedEvent", () => {
  it("accepts the §5b sample — the whole conversation record, not loose fields", () => {
    expect(isChatConversationUpdatedEvent(VALID_UPDATED_EVENT)).toBe(true);
  });

  it("accepts a record with a null lastMessage/groupName/lastMessageAt", () => {
    expect(
      isChatConversationUpdatedEvent({
        eventType: ChatSocketEventType.CONVERSATION_UPDATED,
        conversation: {
          ...VALID_CONVERSATION_RECORD,
          groupName: null,
          lastMessage: null,
          lastMessageAt: null,
        },
      }),
    ).toBe(true);
  });

  it.each([
    ["a malformed conversation record", { conversation: { id: "c1" } }],
    [
      "a participant missing username",
      {
        conversation: {
          ...VALID_CONVERSATION_RECORD,
          participants: [{ ...VALID_PARTICIPANT, username: undefined }],
        },
      },
    ],
    [
      "an unknown conversation type",
      {
        conversation: { ...VALID_CONVERSATION_RECORD, type: "CHANNEL" },
      },
    ],
    ["the old loose-field shape (no `conversation`)", { conversationId: "c1" }],
  ])("rejects %s", (_label, extra) => {
    expect(
      isChatConversationUpdatedEvent({
        eventType: ChatSocketEventType.CONVERSATION_UPDATED,
        ...extra,
      }),
    ).toBe(false);
  });
});

describe("isChatConversationRemovedEvent", () => {
  it("accepts the §5b sample", () => {
    expect(isChatConversationRemovedEvent(VALID_REMOVED_EVENT)).toBe(true);
  });

  it("rejects a missing conversationId", () => {
    expect(
      isChatConversationRemovedEvent({
        eventType: ChatSocketEventType.CONVERSATION_REMOVED,
      }),
    ).toBe(false);
  });
});

describe("isChatConversationSeenEvent", () => {
  it("classifies a conversation.seen payload, unchanged shape", () => {
    expect(isChatConversationSeenEvent(VALID_SEEN_EVENT)).toBe(true);
    expect(isChatConversationUpdatedEvent(VALID_SEEN_EVENT)).toBe(false);
  });
});

describe("isChatConversationSocketEvent", () => {
  it("accepts all three shapes", () => {
    expect(isChatConversationSocketEvent(VALID_UPDATED_EVENT)).toBe(true);
    expect(isChatConversationSocketEvent(VALID_REMOVED_EVENT)).toBe(true);
    expect(isChatConversationSocketEvent(VALID_SEEN_EVENT)).toBe(true);
  });

  it.each([
    // The retired event — no longer part of the contract.
    ["group.deleted", { eventType: "group.deleted", conversationId: "c1" }],
    ["a garbage payload", { hello: "world" }],
    ["not an object at all", "conversation.updated"],
  ])("rejects %s", (_label, payload) => {
    expect(isChatConversationSocketEvent(payload)).toBe(false);
  });
});

describe("isChatMessageEvent", () => {
  it.each([
    ChatSocketEventType.MESSAGE_CREATED,
    ChatSocketEventType.MESSAGE_UPDATED,
    ChatSocketEventType.MESSAGE_DELETED,
  ])("accepts a %s payload", (eventType) => {
    expect(isChatMessageEvent({ eventType, message: VALID_MESSAGE })).toBe(
      true,
    );
  });

  it.each([
    [
      "an unrelated eventType",
      { eventType: "conversation.updated", message: VALID_MESSAGE },
    ],
    [
      "a malformed message",
      { eventType: ChatSocketEventType.MESSAGE_CREATED, message: {} },
    ],
    ["not a record", "message.created"],
  ])("rejects %s", (_label, payload) => {
    expect(isChatMessageEvent(payload)).toBe(false);
  });
});

describe("isChatTypingEvent", () => {
  it("accepts the §5b sample", () => {
    expect(isChatTypingEvent(VALID_TYPING_EVENT)).toBe(true);
  });

  it.each([
    [
      "a missing userId",
      { eventType: ChatSocketEventType.TYPING, conversationId: "c1" },
    ],
    [
      "an unrelated eventType",
      { ...VALID_TYPING_EVENT, eventType: "message.created" },
    ],
  ])("rejects %s", (_label, payload) => {
    expect(isChatTypingEvent(payload)).toBe(false);
  });
});

describe("subscribeToConversationUpdates", () => {
  it("dispatches every recognized event, and drops group.deleted / a malformed payload", () => {
    const { client, emit } = createFakeClient();
    const onEvent = vi.fn();

    subscribeToConversationUpdates(client, onEvent);

    emit("/user/queue/conversations", {
      eventType: "group.deleted",
      conversationId: "c1",
    });
    emit("/user/queue/conversations", {
      eventType: "conversation.updated",
      conversation: { id: "c1" },
    });
    emit("/user/queue/conversations", VALID_UPDATED_EVENT);
    emit("/user/queue/conversations", VALID_REMOVED_EVENT);
    emit("/user/queue/conversations", VALID_SEEN_EVENT);

    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenNthCalledWith(1, VALID_UPDATED_EVENT);
    expect(onEvent).toHaveBeenNthCalledWith(2, VALID_REMOVED_EVENT);
    expect(onEvent).toHaveBeenNthCalledWith(3, VALID_SEEN_EVENT);
  });
});

describe("subscribeToConversationMessages", () => {
  it("dispatches every event type for its own conversation, ignoring a mismatched one", () => {
    const { client, emit } = createFakeClient();
    const onEvent = vi.fn();

    subscribeToConversationMessages(client, "c1", onEvent);

    emit("/topic/conversations/c1/messages", {
      eventType: ChatSocketEventType.MESSAGE_CREATED,
      message: { ...VALID_MESSAGE, conversationId: "c2" },
    });
    emit("/topic/conversations/c1/messages", VALID_MESSAGE_CREATED_EVENT);
    emit("/topic/conversations/c1/messages", {
      eventType: ChatSocketEventType.MESSAGE_UPDATED,
      message: VALID_MESSAGE,
    });
    emit("/topic/conversations/c1/messages", {
      eventType: ChatSocketEventType.MESSAGE_DELETED,
      message: VALID_MESSAGE,
    });

    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenNthCalledWith(1, VALID_MESSAGE_CREATED_EVENT);
  });
});

describe("subscribeToTyping / sendTyping", () => {
  it("dispatches typing for its own conversation, ignoring a mismatched one", () => {
    const { client, emit } = createFakeClient();
    const onTyping = vi.fn();

    subscribeToTyping(client, "c1", onTyping);

    emit("/topic/conversations/c1/typing", {
      ...VALID_TYPING_EVENT,
      conversationId: "c2",
    });
    emit("/topic/conversations/c1/typing", VALID_TYPING_EVENT);

    expect(onTyping).toHaveBeenCalledTimes(1);
    expect(onTyping).toHaveBeenCalledWith(VALID_TYPING_EVENT);
  });

  it("publishes to the conversation's typing destination with no body", () => {
    const { client, publish } = createFakeClient();

    sendTyping(client, "c1");

    expect(publish).toHaveBeenCalledTimes(1);
    const [params] = publish.mock.calls[0] as [
      { destination: string; body?: string },
    ];
    expect(params.destination).toBe("/app/conversations/c1/typing");
    expect(params.body).toBeUndefined();
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
