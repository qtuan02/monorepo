import { describe, expect, it, vi } from "vitest";

import type { HttpClient } from "../../src/client";
import { ChatAuthService } from "../../src/chat/auth-service";

function clientWith(post: HttpClient["post"]): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return { get: unused, post, put: unused, patch: unused, delete: unused };
}

describe("ChatAuthService", () => {
  it("signIn posts the payload and unwraps the envelope down to the access token", async () => {
    const post = vi.fn().mockResolvedValue({
      data: { accessToken: "a-token" },
      message: "Signed in",
      status: 200,
    });
    const service = new ChatAuthService(clientWith(post));

    await expect(
      service.signIn({ username: "tuanhq02", password: "secret1" }),
    ).resolves.toBe("a-token");
    expect(post).toHaveBeenCalledWith("/v1/auth/sign-in", {
      username: "tuanhq02",
      password: "secret1",
    });
  });

  it("signUp posts the payload and resolves with nothing", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatAuthService(clientWith(post));
    const payload = {
      email: "tuan@example.com",
      firstName: "Tuan",
      lastName: "Huynh",
      username: "tuanhq02",
      password: "secret1",
    };

    await expect(service.signUp(payload)).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith("/v1/auth/sign-up", payload);
  });

  it("signOut posts with no body", async () => {
    const post = vi
      .fn()
      .mockResolvedValue({ data: null, message: null, status: 200 });
    const service = new ChatAuthService(clientWith(post));

    await service.signOut();

    expect(post).toHaveBeenCalledWith("/v1/auth/sign-out");
  });

  it("refresh posts with no body and unwraps the envelope down to the access token", async () => {
    const post = vi.fn().mockResolvedValue({
      data: { accessToken: "refreshed-token" },
      message: null,
      status: 200,
    });
    const service = new ChatAuthService(clientWith(post));

    await expect(service.refresh()).resolves.toBe("refreshed-token");
    expect(post).toHaveBeenCalledWith("/v1/auth/refresh");
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const post = vi.fn().mockRejectedValue(failure);
    const service = new ChatAuthService(clientWith(post));

    await expect(service.signIn({ username: "x", password: "y" })).rejects.toBe(
      failure,
    );
  });
});
