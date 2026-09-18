import { describe, expect, it, vi } from "vitest";

import type { ChatMessageRecord } from "@monorepo/types/chat-message";
import { ChatMessageType } from "@monorepo/types/chat-message";

import type { HttpClient } from "../../src/client";
import { ChatMessageService } from "../../src/chat/message-service";

function clientWith(
  overrides: Partial<Pick<HttpClient, "get" | "post">>,
): HttpClient {
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

const MESSAGE: ChatMessageRecord = {
  id: "m1",
  conversationId: "c1",
  senderId: "u1",
  content: "Hello",
  type: ChatMessageType.TEXT,
  createdAt: "2026-09-18T00:00:00.000Z",
  updatedAt: "2026-09-18T00:00:00.000Z",
};

describe("ChatMessageService.getMessages", () => {
  it("GETs the conversation's message path with the cursor params and unwraps `messages` into `items`", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [MESSAGE], nextCursor: "cursor-2" },
      message: null,
      status: 200,
    });
    const service = new ChatMessageService(clientWith({ get }));

    await expect(
      service.getMessages("c1", { limit: 30, cursor: "cursor-1" }),
    ).resolves.toEqual({ items: [MESSAGE], nextCursor: "cursor-2" });
    expect(get).toHaveBeenCalledWith("/v1/conversation/c1/messages", {
      params: { limit: 30, cursor: "cursor-1" },
    });
  });

  it("resolves a null nextCursor as the last page", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [], nextCursor: null },
      message: null,
      status: 200,
    });
    const service = new ChatMessageService(clientWith({ get }));

    await expect(service.getMessages("c1", { limit: 30 })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatMessageService(clientWith({ get }));

    await expect(service.getMessages("c1", { limit: 30 })).rejects.toBe(
      failure,
    );
  });
});

describe("ChatMessageService.sendDirect", () => {
  it("POSTs to /v1/message/direct with the payload and unwraps the record", async () => {
    const post = vi.fn().mockResolvedValue({
      data: MESSAGE,
      message: null,
      status: 200,
    });
    const service = new ChatMessageService(clientWith({ post }));

    await expect(
      service.sendDirect({
        recipientId: "u2",
        content: "Hello",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    ).resolves.toEqual(MESSAGE);
    expect(post).toHaveBeenCalledWith("/v1/message/direct", {
      recipientId: "u2",
      content: "Hello",
      type: ChatMessageType.TEXT,
      attachmentUrl: null,
    });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const post = vi.fn().mockRejectedValue(failure);
    const service = new ChatMessageService(clientWith({ post }));

    await expect(
      service.sendDirect({
        recipientId: "u2",
        content: "Hello",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    ).rejects.toBe(failure);
  });
});

describe("ChatMessageService.sendGroup", () => {
  it("POSTs to /v1/message/group with the payload and unwraps the record", async () => {
    const post = vi.fn().mockResolvedValue({
      data: MESSAGE,
      message: null,
      status: 200,
    });
    const service = new ChatMessageService(clientWith({ post }));

    await expect(
      service.sendGroup({
        conversationId: "c1",
        content: "Hello",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    ).resolves.toEqual(MESSAGE);
    expect(post).toHaveBeenCalledWith("/v1/message/group", {
      conversationId: "c1",
      content: "Hello",
      type: ChatMessageType.TEXT,
      attachmentUrl: null,
    });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const post = vi.fn().mockRejectedValue(failure);
    const service = new ChatMessageService(clientWith({ post }));

    await expect(
      service.sendGroup({
        conversationId: "c1",
        content: "Hello",
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
      }),
    ).rejects.toBe(failure);
  });
});
