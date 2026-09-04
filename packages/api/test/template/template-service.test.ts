import { describe, expect, it, vi } from "vitest";

import type { Template, TemplateListParams } from "@monorepo/types/template";

import type { HttpClient } from "../../src/client";
import { TemplateService } from "../../src/template/template-service";

/**
 * The service is a plain class over an injected `HttpClient`, so the seam is the
 * constructor argument — there is no axios, and no network, anywhere near it.
 */
function clientWith(get: HttpClient["get"]): HttpClient {
  const unused = () =>
    Promise.reject(new Error("This method is not part of the test."));

  return { get, post: unused, put: unused, patch: unused, delete: unused };
}

const ROWS: Template[] = [{ id: "1", name: "Quarterly review" }];

describe("TemplateService.getTemplates", () => {
  it("hands back exactly what the client returned — no envelope", async () => {
    const get = vi.fn().mockResolvedValue(ROWS);
    const service = new TemplateService(clientWith(get));

    await expect(service.getTemplates()).resolves.toBe(ROWS);
  });

  it("names its own path, and sends no params when given none", async () => {
    const get = vi.fn().mockResolvedValue([]);
    const service = new TemplateService(clientWith(get));

    await service.getTemplates();

    expect(get).toHaveBeenCalledWith("/templates", { params: undefined });
  });

  it("forwards the declared list params untouched", async () => {
    const get = vi.fn().mockResolvedValue([]);
    const service = new TemplateService(clientWith(get));
    const params: TemplateListParams = { page: 2, limit: 20 };

    await service.getTemplates(params);

    expect(get).toHaveBeenCalledWith("/templates", { params });
  });

  it("lets a failure through rather than translating it", async () => {
    const failure = new Error("boom");
    const get = vi.fn().mockRejectedValue(failure);
    const service = new TemplateService(clientWith(get));

    await expect(service.getTemplates()).rejects.toBe(failure);
  });
});
