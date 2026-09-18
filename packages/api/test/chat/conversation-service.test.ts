import { describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

import type { HttpClient } from "../../src/client";
import { ChatConversationService } from "../../src/chat/conversation-service";

function clientWith(get: HttpClient["get"]): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return { get, post: unused, put: unused, patch: unused, delete: unused };
}

const CONVERSATION: ChatConversationRecord = {
  id: "c1",
  type: ChatConversationType.DIRECT,
  groupName: null,
  lastMessage: null,
  lastMessageAt: null,
  unreadCount: 0,
  participants: [
    {
      userId: "u1",
      firstName: "Tuan",
      lastName: "Huynh",
      role: ChatParticipantRole.MEMBER,
    },
  ],
};

describe("ChatConversationService.getConversations", () => {
  it("GETs with the cursor params and unwraps the `messages` field into `items`", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [CONVERSATION], nextCursor: "cursor-2" },
      message: null,
      status: 200,
    });
    const service = new ChatConversationService(clientWith(get));

    await expect(
      service.getConversations({ limit: 20, cursor: "cursor-1" }),
    ).resolves.toEqual({ items: [CONVERSATION], nextCursor: "cursor-2" });
    expect(get).toHaveBeenCalledWith("/v1/conversation", {
      params: { limit: 20, cursor: "cursor-1" },
    });
  });

  it("resolves a null nextCursor as the last page", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [], nextCursor: null },
      message: null,
      status: 200,
    });
    const service = new ChatConversationService(clientWith(get));

    await expect(service.getConversations({ limit: 20 })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatConversationService(clientWith(get));

    await expect(service.getConversations({ limit: 20 })).rejects.toBe(failure);
  });
});
