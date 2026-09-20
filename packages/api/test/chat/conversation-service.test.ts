import { describe, expect, it, vi } from "vitest";

import type { ChatConversationRecord } from "@monorepo/types/chat-conversation";
import {
  ChatConversationType,
  ChatParticipantRole,
} from "@monorepo/types/chat-conversation";

import type { HttpClient } from "../../src/client";
import { ChatConversationService } from "../../src/chat/conversation-service";

function clientWith(overrides: Partial<HttpClient>): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return {
    get: unused,
    post: unused,
    put: unused,
    patch: unused,
    delete: unused,
    ...overrides,
  };
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
    const service = new ChatConversationService(clientWith({ get }));

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
    const service = new ChatConversationService(clientWith({ get }));

    await expect(service.getConversations({ limit: 20 })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatConversationService(clientWith({ get }));

    await expect(service.getConversations({ limit: 20 })).rejects.toBe(failure);
  });
});

const GROUP: ChatConversationRecord = {
  id: "c2",
  type: ChatConversationType.GROUP,
  groupName: "Team Alpha",
  lastMessage: null,
  lastMessageAt: null,
  unreadCount: 0,
  participants: [
    {
      userId: "u1",
      firstName: "Tuan",
      lastName: "Huynh",
      role: ChatParticipantRole.ADMIN,
    },
    {
      userId: "u2",
      firstName: "Lan",
      lastName: "Nguyen",
      role: ChatParticipantRole.MEMBER,
    },
  ],
};

describe("ChatConversationService.createGroup", () => {
  it("POSTs to /v1/conversation and unwraps the envelope", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: GROUP, message: null, status: 200 });
    const service = new ChatConversationService(clientWith({ post }));

    await expect(
      service.createGroup({
        type: "GROUP",
        name: "Team Alpha",
        memberIds: ["u2"],
      }),
    ).resolves.toBe(GROUP);
    expect(post).toHaveBeenCalledWith("/v1/conversation", {
      type: "GROUP",
      name: "Team Alpha",
      memberIds: ["u2"],
    });
  });
});

describe("ChatConversationService.updateGroup", () => {
  it("PATCHes the group subpath with the new name", async () => {
    const patch = vi
      .fn()
      .mockResolvedValue({ data: GROUP, message: null, status: 200 });
    const service = new ChatConversationService(clientWith({ patch }));

    await expect(
      service.updateGroup("c2", { name: "Team Alpha" }),
    ).resolves.toBe(GROUP);
    expect(patch).toHaveBeenCalledWith("/v1/conversation/c2/group", {
      name: "Team Alpha",
    });
  });
});

describe("ChatConversationService.addMembers", () => {
  it("POSTs the member ids to the members subpath", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: GROUP, message: null, status: 200 });
    const service = new ChatConversationService(clientWith({ post }));

    await expect(service.addMembers("c2", { memberIds: ["u3"] })).resolves.toBe(
      GROUP,
    );
    expect(post).toHaveBeenCalledWith("/v1/conversation/c2/members", {
      memberIds: ["u3"],
    });
  });
});

describe("ChatConversationService.removeMember", () => {
  it("DELETEs the member's own subpath", async () => {
    const del = vi
      .fn()
      .mockResolvedValue({ data: GROUP, message: null, status: 200 });
    const service = new ChatConversationService(clientWith({ delete: del }));

    await expect(service.removeMember("c2", "u2")).resolves.toBe(GROUP);
    expect(del).toHaveBeenCalledWith("/v1/conversation/c2/members/u2");
  });
});

describe("ChatConversationService.leave", () => {
  it("POSTs to the leave subpath with no body", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatConversationService(clientWith({ post }));

    await expect(service.leave("c2")).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith("/v1/conversation/c2/leave");
  });
});
