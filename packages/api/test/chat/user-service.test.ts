import { describe, expect, it, vi } from "vitest";

import type { ChatUserProfile } from "@monorepo/types/chat-user";

import type { HttpClient } from "../../src/client";
import { ChatUserService } from "../../src/chat/user-service";

function clientWith(get: HttpClient["get"]): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return { get, post: unused, put: unused, patch: unused, delete: unused };
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
    const service = new ChatUserService(clientWith(get));

    await expect(service.me()).resolves.toBe(PROFILE);
    expect(get).toHaveBeenCalledWith("/v1/user/me");
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatUserService(clientWith(get));

    await expect(service.me()).rejects.toBe(failure);
  });
});
