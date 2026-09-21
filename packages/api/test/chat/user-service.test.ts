import { describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";
import { FriendStatus } from "@monorepo/types/chat-friend";

import type { HttpClient } from "../../src/client";
import { ChatUserService } from "../../src/chat/user-service";

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

const PROFILE: ChatUserProfile = {
  id: "u1",
  username: "tuanhq02",
  firstName: "Tuan",
  lastName: "Huynh",
};

describe("ChatUserService.me", () => {
  it("GETs its own path and unwraps the envelope down to the profile", async () => {
    const get = vi
      .fn()
      .mockResolvedValue({ data: PROFILE, message: null, status: 200 });
    const service = new ChatUserService(clientWith({ get }));

    await expect(service.me()).resolves.toBe(PROFILE);
    expect(get).toHaveBeenCalledWith("/v1/user/me");
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatUserService(clientWith({ get }));

    await expect(service.me()).rejects.toBe(failure);
  });
});

describe("ChatUserService.search", () => {
  it("GETs with the offset params and unwraps `items`", async () => {
    const record = {
      id: "u2",
      username: "lan",
      firstName: "Lan",
      lastName: "Nguyen",
      joinedAt: "2026-01-01T00:00:00.000Z",
      statusFriend: FriendStatus.NONE,
    };
    const get = vi.fn().mockResolvedValue({
      data: { items: [record], nextOffset: null },
      message: null,
      status: 200,
    });
    const service = new ChatUserService(clientWith({ get }));

    await expect(service.search({ search: "lan", limit: 20 })).resolves.toEqual(
      { items: [record], nextOffset: null },
    );
    expect(get).toHaveBeenCalledWith("/v1/user", {
      params: { search: "lan", limit: 20 },
    });
  });
});

describe("ChatUserService.info", () => {
  it("GETs the user's own path and unwraps the envelope", async () => {
    const info = {
      id: "u2",
      username: "lan",
      firstName: "Lan",
      lastName: "Nguyen",
      statusFriend: FriendStatus.FRIEND,
    };
    const get = vi
      .fn()
      .mockResolvedValue({ data: info, message: null, status: 200 });
    const service = new ChatUserService(clientWith({ get }));

    await expect(service.info("u2")).resolves.toBe(info);
    expect(get).toHaveBeenCalledWith("/v1/user/u2");
  });
});

describe("ChatUserService.updateMe", () => {
  it("PATCHes its own path and unwraps the envelope down to the profile", async () => {
    const updated: ChatUserProfile = { ...PROFILE, bio: "Hello there" };
    const patch = vi
      .fn()
      .mockResolvedValue({ data: updated, message: null, status: 200 });
    const service = new ChatUserService(clientWith({ patch }));

    await expect(service.updateMe({ bio: "Hello there" })).resolves.toBe(
      updated,
    );
    expect(patch).toHaveBeenCalledWith("/v1/user/me", { bio: "Hello there" });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const patch = vi.fn().mockRejectedValue(failure);
    const service = new ChatUserService(clientWith({ patch }));

    await expect(service.updateMe({ bio: "x" })).rejects.toBe(failure);
  });
});

describe("ChatUserService.changePassword", () => {
  it("PATCHes the password subpath with the two passwords", async () => {
    const patch = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 204 });
    const service = new ChatUserService(clientWith({ patch }));

    await expect(
      service.changePassword({
        currentPassword: "old-pass",
        newPassword: "new-pass",
      }),
    ).resolves.toBeUndefined();
    expect(patch).toHaveBeenCalledWith("/v1/user/me/password", {
      currentPassword: "old-pass",
      newPassword: "new-pass",
    });
  });
});
