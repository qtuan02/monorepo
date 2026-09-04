import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { createHttpClient, HttpError } from "../src/client";

const BASE_URL = "https://api.example.test";

interface StubResponse {
  status: number;
  data: unknown;
}

/**
 * The seam is axios's own `adapter` hook, handed in through the per-request
 * config the `HttpClient` already forwards. Mocking the whole `axios` module
 * instead would test the mock: the interceptors under test — the auth header and
 * the `HttpError` normalization — are exactly what a module mock replaces.
 */
function stubAdapter(
  respond: (config: InternalAxiosRequestConfig) => StubResponse,
): { adapter: AxiosAdapter; calls: InternalAxiosRequestConfig[] } {
  const calls: InternalAxiosRequestConfig[] = [];

  const adapter: AxiosAdapter = (config) => {
    calls.push(config);

    const { status, data } = respond(config);
    const response: AxiosResponse<unknown> = {
      data,
      status,
      statusText: "",
      headers: {},
      config,
    };

    if (status >= 200 && status < 300) {
      return Promise.resolve(response);
    }

    // A real adapter is what decides success from failure, so a stub has to
    // settle the status itself before the response interceptor ever sees it.
    return Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        response,
      ),
    );
  };

  return { adapter, calls };
}

/** Rejects with no response at all — a DNS failure or a timeout. */
const networkFailureAdapter: AxiosAdapter = (config) =>
  Promise.reject(
    new AxiosError("Network Error", AxiosError.ERR_NETWORK, config),
  );

function okAdapter(data: unknown) {
  return stubAdapter(() => ({ status: 200, data }));
}

function lastCall(
  calls: InternalAxiosRequestConfig[],
): InternalAxiosRequestConfig {
  const call = calls.at(-1);

  if (!call) {
    throw new Error("The adapter was never called.");
  }

  return call;
}

async function rejection(promise: Promise<unknown>): Promise<HttpError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HttpError) {
      return error;
    }

    throw error;
  }

  throw new Error("Expected the request to reject, but it resolved.");
}

describe("createHttpClient — requests", () => {
  it("sends the path against the configured base URL", async () => {
    const { adapter, calls } = okAdapter([]);
    const client = createHttpClient({ baseURL: BASE_URL });

    await client.get("/templates", { adapter });

    expect(lastCall(calls).baseURL).toBe(BASE_URL);
    expect(lastCall(calls).url).toBe("/templates");
    expect(lastCall(calls).method).toBe("get");
  });

  it("applies a default timeout, and honours an explicit one", async () => {
    const relaxed = okAdapter([]);
    const strict = okAdapter([]);
    const defaultClient = createHttpClient({ baseURL: BASE_URL });
    const strictClient = createHttpClient({ baseURL: BASE_URL, timeout: 500 });

    await defaultClient.get("/templates", { adapter: relaxed.adapter });
    await strictClient.get("/templates", { adapter: strict.adapter });

    expect(lastCall(relaxed.calls).timeout).toBe(10_000);
    expect(lastCall(strict.calls).timeout).toBe(500);
  });

  it("returns the raw response body — there is no envelope to unwrap", async () => {
    const { adapter } = okAdapter([{ id: "1", name: "Quarterly review" }]);
    const client = createHttpClient({ baseURL: BASE_URL });

    await expect(client.get("/templates", { adapter })).resolves.toEqual([
      { id: "1", name: "Quarterly review" },
    ]);
  });

  it("carries the body and the verb of every write method", async () => {
    const { adapter, calls } = okAdapter({});
    const client = createHttpClient({ baseURL: BASE_URL });
    const body = { name: "Quarterly review" };

    await client.post("/templates", body, { adapter });
    // The default `transformRequest` serializes a plain object before it
    // reaches the adapter, so the wire value is the JSON, not the object.
    expect(lastCall(calls).method).toBe("post");
    expect(lastCall(calls).data).toBe(JSON.stringify(body));

    await client.put("/templates/1", body, { adapter });
    expect(lastCall(calls).method).toBe("put");

    await client.patch("/templates/1", body, { adapter });
    expect(lastCall(calls).method).toBe("patch");

    await client.delete("/templates/1", { adapter });
    expect(lastCall(calls).method).toBe("delete");
    expect(lastCall(calls).data).toBeUndefined();
  });

  it("forwards a caller's config but keeps the verb and path its own", async () => {
    const { adapter, calls } = okAdapter([]);
    const client = createHttpClient({ baseURL: BASE_URL });

    await client.get("/templates", {
      adapter,
      params: { page: 2 },
      // The caller's config is spread FIRST, so these two lose. Letting them win
      // would mean a service's declared path and verb are only a suggestion.
      method: "DELETE",
      url: "/somewhere-else",
    });

    expect(lastCall(calls).params).toEqual({ page: 2 });
    expect(lastCall(calls).method).toBe("get");
    expect(lastCall(calls).url).toBe("/templates");
  });
});

describe("createHttpClient — the auth header", () => {
  it("sends no Authorization header when no token reader is supplied", async () => {
    const { adapter, calls } = okAdapter([]);
    const client = createHttpClient({ baseURL: BASE_URL });

    await client.get("/templates", { adapter });

    expect(lastCall(calls).headers.get("Authorization")).toBeUndefined();
  });

  it("attaches the bearer token the reader returns", async () => {
    const { adapter, calls } = okAdapter([]);
    const client = createHttpClient({
      baseURL: BASE_URL,
      getAuthToken: () => "token-1",
    });

    await client.get("/templates", { adapter });

    expect(lastCall(calls).headers.get("Authorization")).toBe("Bearer token-1");
  });

  it("sends nothing when the reader has no token yet", async () => {
    const { adapter, calls } = okAdapter([]);
    const client = createHttpClient({
      baseURL: BASE_URL,
      getAuthToken: () => null,
    });

    await client.get("/templates", { adapter });

    expect(lastCall(calls).headers.get("Authorization")).toBeUndefined();
  });

  it("reads the token per request, not once at construction", async () => {
    const { adapter, calls } = okAdapter([]);
    let token: string | null = null;
    const client = createHttpClient({
      baseURL: BASE_URL,
      getAuthToken: () => token,
    });

    await client.get("/templates", { adapter });
    expect(lastCall(calls).headers.get("Authorization")).toBeUndefined();

    token = "token-2";
    await client.get("/templates", { adapter });
    expect(lastCall(calls).headers.get("Authorization")).toBe("Bearer token-2");
  });
});

describe("createHttpClient — failures become HttpError", () => {
  it("takes the status and the body's message", async () => {
    const { adapter } = stubAdapter(() => ({
      status: 422,
      data: { message: "The name is invalid." },
    }));
    const client = createHttpClient({ baseURL: BASE_URL });

    const error = await rejection(client.get("/templates", { adapter }));

    expect(error.statusCode).toBe(422);
    expect(error.message).toBe("The name is invalid.");
    expect(error.name).toBe("HttpError");
  });

  it("falls back to axios's own message when the body carries none", async () => {
    const { adapter } = stubAdapter(() => ({ status: 500, data: {} }));
    const client = createHttpClient({ baseURL: BASE_URL });

    const error = await rejection(client.get("/templates", { adapter }));

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Request failed with status code 500");
  });

  it("uses statusCode 0 when the failure never reached a response", async () => {
    const client = createHttpClient({ baseURL: BASE_URL });

    const error = await rejection(
      client.get("/templates", { adapter: networkFailureAdapter }),
    );

    expect(error.statusCode).toBe(0);
    expect(error.message).toBe("Network Error");
    expect(error.response).toBeUndefined();
  });

  it("notifies onUnauthorized on a 401 and still rejects", async () => {
    const onUnauthorized = vi.fn();
    const { adapter } = stubAdapter(() => ({ status: 401, data: {} }));
    const client = createHttpClient({ baseURL: BASE_URL, onUnauthorized });

    const error = await rejection(client.get("/templates", { adapter }));

    expect(error.statusCode).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledWith(error);
  });

  it("leaves onUnauthorized alone for any other status", async () => {
    const onUnauthorized = vi.fn();
    const { adapter } = stubAdapter(() => ({ status: 403, data: {} }));
    const client = createHttpClient({ baseURL: BASE_URL, onUnauthorized });

    await rejection(client.get("/templates", { adapter }));

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

describe("HttpError predicates", () => {
  const at = (statusCode: number) =>
    new HttpError({ statusCode, message: "boom" });

  it("names the 4xx range as a client error", () => {
    expect(at(400).isClientError()).toBe(true);
    expect(at(499).isClientError()).toBe(true);
    expect(at(500).isClientError()).toBe(false);
    expect(at(399).isClientError()).toBe(false);
  });

  it("names the 5xx range as a server error", () => {
    expect(at(500).isServerError()).toBe(true);
    expect(at(503).isServerError()).toBe(true);
    expect(at(499).isServerError()).toBe(false);
  });

  it("recognises 401 and 403 on their own", () => {
    expect(at(401).isUnauthorized()).toBe(true);
    expect(at(403).isUnauthorized()).toBe(false);
    expect(at(403).isForbidden()).toBe(true);
    expect(at(401).isForbidden()).toBe(false);
  });

  it("treats a response-less failure as neither client nor server", () => {
    expect(at(0).isClientError()).toBe(false);
    expect(at(0).isServerError()).toBe(false);
  });
});
