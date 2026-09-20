import { describe, expect, it } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";
import { ChatMessageType } from "@monorepo/types/chat-message";

import { mapConversationToUiModel } from "~/features/conversation/utils/map-conversation-to-ui-model";
import i18n from "~/libs/i18n";

const CURRENT_USER_ID = "u1";

// Wraps the util with the real catalogue's `t`, pinned to `en` by
// vitest.setup.ts, exactly what every caller (use-conversation-list.ts,
// conversation-panel.tsx) hands it.
function toUiModel(record: ChatConversationRecord) {
  return mapConversationToUiModel(record, CURRENT_USER_ID, i18n.t);
}

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
        username: "tuanhq02",
        firstName: "Tuan",
        lastName: "Huynh",
        role: ChatParticipantRole.MEMBER,
      },
      {
        userId: "u2",
        username: "lan",
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
    const conversation = toUiModel(directConversation());

    expect(conversation.title).toBe("Lan Nguyen");
    expect(conversation.avatarUrl).toBe("https://example.com/lan.png");
  });

  it("titles a group conversation with its group name, never the members", () => {
    const conversation = toUiModel(
      directConversation({
        type: ChatConversationType.GROUP,
        groupName: "Weekend trip",
      }),
    );

    expect(conversation.title).toBe("Weekend trip");
    // A group has no single avatar of its own.
    expect(conversation.avatarUrl).toBeUndefined();
  });

  it("falls back to a generic name once every field a display name could use is missing", () => {
    const conversation = toUiModel(
      directConversation({
        participants: [
          {
            userId: CURRENT_USER_ID,
            username: "tuanhq02",
            firstName: "Tuan",
            lastName: "Huynh",
            role: ChatParticipantRole.MEMBER,
          },
          {
            userId: "u2",
            username: "",
            firstName: "",
            lastName: "",
            role: ChatParticipantRole.MEMBER,
          },
        ],
      }),
    );

    expect(conversation.title).toBe("Unknown user");
  });

  it("treats a missing participants array as empty rather than throwing", () => {
    const record = {
      ...directConversation(),
      participants: undefined,
    } as unknown as ChatConversationRecord;

    const conversation = toUiModel(record);

    expect(conversation.members).toEqual([]);
    expect(conversation.title).toBe("Direct message");
  });

  it("reads 'No messages yet.' when the conversation has no last message", () => {
    const conversation = toUiModel(directConversation());

    expect(conversation.lastMessage).toBe("No messages yet.");
  });

  it("prefixes the last message with 'You' when the current user sent it", () => {
    const conversation = toUiModel(
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
    );

    expect(conversation.lastMessage).toBe("You: See you tomorrow");
  });

  it("prefixes the last message with the sender's name when someone else sent it", () => {
    const conversation = toUiModel(
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
    );

    expect(conversation.lastMessage).toBe("Lan Nguyen: See you tomorrow");
  });

  it("falls back to a generic sender name when the last message's sender has left", () => {
    const conversation = toUiModel(
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
    );

    expect(conversation.lastMessage).toBe("Unknown user: See you tomorrow");
  });

  it("carries the unread count and every member through unchanged", () => {
    const conversation = toUiModel(directConversation({ unreadCount: 3 }));

    expect(conversation.unreadCount).toBe(3);
    expect(conversation.members).toHaveLength(2);
    expect(conversation.members[1]).toEqual({
      userId: "u2",
      displayName: "Lan Nguyen",
      username: "lan",
      avatarUrl: "https://example.com/lan.png",
      role: ChatParticipantRole.MEMBER,
    });
  });

  describe("attachment preview (T2, spec #253)", () => {
    it("previews a text-less IMAGE last message with a camera emoji", () => {
      const conversation = toUiModel(
        directConversation({
          lastMessage: {
            id: "m1",
            conversationId: "c1",
            senderId: "u2",
            content: "",
            attachmentUrl: "http://localhost:8089/api/files/abc.png",
            type: ChatMessageType.IMAGE,
            createdAt: "2026-09-16T00:00:00.000Z",
            updatedAt: "2026-09-16T00:00:00.000Z",
          },
        }),
      );

      expect(conversation.lastMessage).toBe("Lan Nguyen: 📷 Photo");
    });

    it("previews a text-less FILE last message with a paperclip emoji", () => {
      const conversation = toUiModel(
        directConversation({
          lastMessage: {
            id: "m1",
            conversationId: "c1",
            senderId: CURRENT_USER_ID,
            content: "",
            attachmentUrl: "http://localhost:8089/api/files/report.pdf",
            type: ChatMessageType.FILE,
            createdAt: "2026-09-16T00:00:00.000Z",
            updatedAt: "2026-09-16T00:00:00.000Z",
          },
        }),
      );

      expect(conversation.lastMessage).toBe("You: 📎 File");
    });

    it("still previews the caption, not the emoji, when an attachment message has text", () => {
      const conversation = toUiModel(
        directConversation({
          lastMessage: {
            id: "m1",
            conversationId: "c1",
            senderId: "u2",
            content: "Check this out",
            attachmentUrl: "http://localhost:8089/api/files/abc.png",
            type: ChatMessageType.IMAGE,
            createdAt: "2026-09-16T00:00:00.000Z",
            updatedAt: "2026-09-16T00:00:00.000Z",
          },
        }),
      );

      expect(conversation.lastMessage).toBe("Lan Nguyen: Check this out");
    });
  });
});
