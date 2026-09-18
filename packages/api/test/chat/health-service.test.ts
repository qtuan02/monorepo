import { describe, expect, it, vi } from "vitest";

import type { HttpClient } from "../../src/client";
import { ChatHealthService } from "../../src/chat/health-service";

function clientWith(get: HttpClient["get"]): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return { get, post: unused, put: unused, patch: unused, delete: unused };
}

describe("ChatHealthService.check", () => {
  it("GETs the health-check path and resolves with no value", async () => {
    const get = vi.fn().mockResolvedValue(true);
    const service = new ChatHealthService(clientWith(get));

    await expect(service.check()).resolves.toBeUndefined();
    expect(get).toHaveBeenCalledWith("/health-check");
  });

  it("lets a failure through rather than swallowing it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new ChatHealthService(clientWith(get));

    await expect(service.check()).rejects.toBe(failure);
  });
});
