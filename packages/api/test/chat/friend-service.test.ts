import { describe, expect, it, vi } from "vitest";

import type {
  ChatFriendRecord,
  ChatFriendRequestUser,
} from "@monorepo/types/chat-friend";

import type { HttpClient } from "../../src/client";
import { ChatFriendService } from "../../src/chat/friend-service";

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

const FRIEND: ChatFriendRecord = {
  id: "u2",
  username: "lan",
  firstName: "Lan",
  lastName: "Nguyen",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

const REQUEST_USER: ChatFriendRequestUser = {
  id: "u3",
  username: "minh",
  firstName: "Minh",
  lastName: "Tran",
};

describe("ChatFriendService.list", () => {
  it("GETs with the offset params and unwraps `messages` into `items`", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [FRIEND], nextOffset: 50 },
      message: null,
      status: 200,
    });
    const service = new ChatFriendService(clientWith({ get }));

    await expect(service.list({ limit: 50, offset: 0 })).resolves.toEqual({
      items: [FRIEND],
      nextOffset: 50,
    });
    expect(get).toHaveBeenCalledWith("/v1/friend", {
      params: { limit: 50, offset: 0 },
    });
  });

  it("resolves a null nextOffset as the last page", async () => {
    const get = vi.fn().mockResolvedValue({
      data: { messages: [], nextOffset: null },
      message: null,
      status: 200,
    });
    const service = new ChatFriendService(clientWith({ get }));

    await expect(service.list({ limit: 50 })).resolves.toEqual({
      items: [],
      nextOffset: null,
    });
  });
});

describe("ChatFriendService.requests", () => {
  it("GETs and returns the envelope's data as-is", async () => {
    const payload = { sentRequests: [], receivedRequests: [] };
    const get = vi
      .fn()
      .mockResolvedValue({ data: payload, message: null, status: 200 });
    const service = new ChatFriendService(clientWith({ get }));

    await expect(service.requests()).resolves.toBe(payload);
    expect(get).toHaveBeenCalledWith("/v1/friend/request");
  });
});

describe("ChatFriendService.send", () => {
  it("POSTs the payload and unwraps the response", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: "Request sent", status: 200 });
    const service = new ChatFriendService(clientWith({ post }));

    await expect(service.send({ toUserId: "u2" })).resolves.toBeNull();
    expect(post).toHaveBeenCalledWith("/v1/friend/request", {
      toUserId: "u2",
    });
  });
});

describe("ChatFriendService.accept", () => {
  it("POSTs the requestId and unwraps the accepted user", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: REQUEST_USER, message: null, status: 200 });
    const service = new ChatFriendService(clientWith({ post }));

    await expect(service.accept({ requestId: "r1" })).resolves.toBe(
      REQUEST_USER,
    );
    expect(post).toHaveBeenCalledWith("/v1/friend/accept", {
      requestId: "r1",
    });
  });
});

describe("ChatFriendService.decline", () => {
  it("POSTs the requestId", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatFriendService(clientWith({ post }));

    await service.decline({ requestId: "r1" });
    expect(post).toHaveBeenCalledWith("/v1/friend/decline", {
      requestId: "r1",
    });
  });
});

describe("ChatFriendService.cancel", () => {
  it("POSTs the requestId", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatFriendService(clientWith({ post }));

    await service.cancel({ requestId: "r1" });
    expect(post).toHaveBeenCalledWith("/v1/friend/cancel", {
      requestId: "r1",
    });
  });
});

describe("ChatFriendService.remove", () => {
  it("DELETEs the friend's own path", async () => {
    const del = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatFriendService(clientWith({ delete: del }));

    await service.remove("u2");
    expect(del).toHaveBeenCalledWith("/v1/friend/u2");
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const del = vi.fn().mockRejectedValue(failure);
    const service = new ChatFriendService(clientWith({ delete: del }));

    await expect(service.remove("u2")).rejects.toBe(failure);
  });
});
