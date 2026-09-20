import { describe, expect, it } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { mapConversationToUiModel } from "~/features/conversation/utils/map-conversation-to-ui-model";

const CURRENT_USER_ID = "u1";

function directConversation(
  overrides: Partial<ChatConversationRecord> = {},
): ChatConversationRecord {
  return {
    id: "c1",
    type: ChatConversationType.DIRECT,
    groupName: null,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    participants: [
      {
        userId: CURRENT_USER_ID,
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: "u2",
        firstName: "Lan",
        lastName: "Nguyen",
        avatarUrl: "https://example.com/lan.png",
        role: ChatParticipantRole.MEMBER,
      },
    ],
    ...overrides,
  };
}

describe("mapConversationToUiModel", () => {
  it("titles a direct conversation with the other participant's name", () => {
    const conversation = mapConversationToUiModel(
      directConversation(),
      CURRENT_USER_ID,
    );

    expect(conversation.title).toBe("Lan Nguyen");
    expect(conversation.avatarUrl).toBe("https://example.com/lan.png");
  });

  it("titles a group conversation with its group name, never the members", () => {
    const conversation = mapConversationToUiModel(
      directConversation({
        type: ChatConversationType.GROUP,
        groupName: "Weekend trip",
      }),
      CURRENT_USER_ID,
    );

    expect(conversation.title).toBe("Weekend trip");
    // A group has no single avatar of its own.
    expect(conversation.avatarUrl).toBeUndefined();
  });

  it("falls back to a generic name once every field a display name could use is missing", () => {
    const conversation = mapConversationToUiModel(
      directConversation({
        participants: [
          {
            userId: CURRENT_USER_ID,
            firstName: "Tuan",
            lastName: "Huynh",
            role: ChatParticipantRole.MEMBER,
          },
          {
            userId: "u2",
            firstName: "",
            lastName: "",
            role: ChatParticipantRole.MEMBER,
          },
        ],
      }),
      CURRENT_USER_ID,
    );

    expect(conversation.title).toBe("Unknown user");
  });

  it("treats a missing participants array as empty rather than throwing", () => {
    const record = {
      ...directConversation(),
      participants: undefined,
    } as unknown as ChatConversationRecord;

    const conversation = mapConversationToUiModel(record, CURRENT_USER_ID);

    expect(conversation.members).toEqual([]);
    expect(conversation.title).toBe("Direct message");
  });

  it("reads 'No messages yet.' when the conversation has no last message", () => {
    const conversation = mapConversationToUiModel(
      directConversation(),
      CURRENT_USER_ID,
    );

    expect(conversation.lastMessage).toBe("No messages yet.");
  });

  it("prefixes the last message with 'You' when the current user sent it", () => {
    const conversation = mapConversationToUiModel(
      directConversation({
        lastMessage: {
          id: "m1",
          conversationId: "c1",
          senderId: CURRENT_USER_ID,
          content: "See you tomorrow",
          type: ChatMessageType.TEXT,
          createdAt: "2026-09-16T00:00:00.000Z",
          updatedAt: "2026-09-16T00:00:00.000Z",
        },
      }),
      CURRENT_USER_ID,
    );

    expect(conversation.lastMessage).toBe("You: See you tomorrow");
  });

  it("prefixes the last message with the sender's name when someone else sent it", () => {
    const conversation = mapConversationToUiModel(
      directConversation({
        lastMessage: {
          id: "m1",
          conversationId: "c1",
          senderId: "u2",
          content: "See you tomorrow",
          type: ChatMessageType.TEXT,
          createdAt: "2026-09-16T00:00:00.000Z",
          updatedAt: "2026-09-16T00:00:00.000Z",
        },
      }),
      CURRENT_USER_ID,
    );

    expect(conversation.lastMessage).toBe("Lan Nguyen: See you tomorrow");
  });

  it("falls back to a generic sender name when the last message's sender has left", () => {
    const conversation = mapConversationToUiModel(
      directConversation({
        lastMessage: {
          id: "m1",
          conversationId: "c1",
          senderId: "left-the-conversation",
          content: "See you tomorrow",
          type: ChatMessageType.TEXT,
          createdAt: "2026-09-16T00:00:00.000Z",
          updatedAt: "2026-09-16T00:00:00.000Z",
        },
      }),
      CURRENT_USER_ID,
    );

    expect(conversation.lastMessage).toBe("Unknown user: See you tomorrow");
  });

  it("carries the unread count and every member through unchanged", () => {
    const conversation = mapConversationToUiModel(
      directConversation({ unreadCount: 3 }),
      CURRENT_USER_ID,
    );

    expect(conversation.unreadCount).toBe(3);
    expect(conversation.members).toHaveLength(2);
    expect(conversation.members[1]).toEqual({
      userId: "u2",
      displayName: "Lan Nguyen",
      avatarUrl: "https://example.com/lan.png",
      role: ChatParticipantRole.MEMBER,
    });
  });
});
