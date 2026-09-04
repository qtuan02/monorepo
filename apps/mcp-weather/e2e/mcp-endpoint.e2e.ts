import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * The contract another backend already depends on: `POST /api/mcp`, Streamable
 * HTTP, no auth, three tools. It is asserted through the `request` fixture on
 * the **built** server, with no browser — which is the only honest way to prove
 * an endpoint a model client calls, and the reason these assertions are here
 * rather than in a jsdom test.
 *
 * The path is a literal rather than a `ROUTES` entry on purpose: it is the URL a
 * client outside this repo has hard-coded, so the literal *is* the assertion.
 */
const MCP_ENDPOINT = "/api/mcp";

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

/**
 * The spec requires a client to advertise both content types on POST — a server
 * that answers a request without them is out of spec, so sending them is part of
 * what this file is testing.
 */
async function callMcp(
  request: APIRequestContext,
  body: Record<string, unknown>,
): Promise<JsonRpcResponse> {
  const response = await request.post(MCP_ENDPOINT, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    data: body,
  });

  expect(response.status()).toBe(200);

  return (await response.json()) as JsonRpcResponse;
}

const INITIALIZE = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "e2e", version: "1.0.0" },
  },
} as const;

test.describe("the MCP endpoint", () => {
  test("initializes and names itself", async ({ request }) => {
    const body = await callMcp(request, INITIALIZE);

    expect(body.error).toBeUndefined();
    // The server name a client may key its own config on — kept from the app
    // this one replaced.
    expect(body.result?.serverInfo).toMatchObject({ name: "tuan-mcp" });
    expect(body.result?.protocolVersion).toEqual(expect.any(String));
  });

  test("lists exactly the three tools it has always exposed", async ({
    request,
  }) => {
    // Stateless: every request builds its own server and transport, so
    // `tools/list` needs no session from the call above.
    await callMcp(request, INITIALIZE);

    const body = await callMcp(request, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });

    const tools = (body.result?.tools ?? []) as { name: string }[];

    expect(
      tools.map((tool) => tool.name).sort((a, b) => a.localeCompare(b)),
    ).toEqual(["get-forecast", "get-weather", "hello-world"]);
  });

  test("answers a hello-world call", async ({ request }) => {
    await callMcp(request, INITIALIZE);

    const body = await callMcp(request, {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "hello-world", arguments: {} },
    });

    expect(body.error).toBeUndefined();
    // Both halves of the answer: the text a model reads and the structured
    // payload a client parses. No API key is involved, which is why this is the
    // call CI can make.
    expect(body.result?.structuredContent).toEqual({
      message: "Hello, World!",
    });
    expect(body.result?.content).toEqual([
      { type: "text", text: JSON.stringify({ message: "Hello, World!" }) },
    ]);
  });

  test("is reached with no auth and no locale prefix", async ({ request }) => {
    // `/api` is outside the proxy's matcher, so neither the session guard nor
    // next-intl ever sees this path: no redirect, no `/vi/api/mcp`.
    const response = await request.post(MCP_ENDPOINT, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      data: INITIALIZE,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(200);
  });
});
