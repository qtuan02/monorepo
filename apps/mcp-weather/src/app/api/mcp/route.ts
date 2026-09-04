import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { createWeatherMcpServer } from "~/features/weather/server/mcp-server";

/**
 * The MCP endpoint — Streamable HTTP, stateless, no auth. It sits outside
 * `[locale]`, and `proxy.ts`'s matcher already excludes `/api`, so neither the
 * session guard nor locale negotiation ever touches it.
 *
 * A thin route module, like every other one in this app: it adapts HTTP to the
 * slice and owns no protocol logic. The tools, their schemas and the
 * OpenWeatherMap calls live in `~/features/weather/`.
 *
 * `WebStandardStreamableHTTPServerTransport` takes a `Request` and returns a
 * `Response`, which is exactly what an App Router handler is handed — the
 * Node-shaped `StreamableHTTPServerTransport` is the one that would need an
 * `IncomingMessage`/`ServerResponse` shim around it.
 */

/**
 * Stateless: no `Mcp-Session-Id` is minted or expected, so any instance can
 * answer any request and nothing has to be kept between them. One server and one
 * transport per request is what that mode requires — see
 * `~/features/weather/server/mcp-server.ts`.
 */
async function handleMcpRequest(
  request: Request,
  { enableJsonResponse }: { enableJsonResponse: boolean },
): Promise<Response> {
  try {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse,
    });

    await createWeatherMcpServer().connect(transport);

    return await transport.handleRequest(request);
  } catch (error) {
    // Anything thrown before the transport could answer — it never gets to write
    // a JSON-RPC error itself, so one is written here. `id: null` is what the
    // spec prescribes when the failure is not attributable to one request.
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        id: null,
      },
      { status: 500 },
    );
  }
}

/** The SSE half of the transport, which a client opens to receive server pushes. */
export function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request, { enableJsonResponse: false });
}

/**
 * Every JSON-RPC call — `initialize`, `tools/list`, `tools/call`. A single JSON
 * body back rather than an SSE frame per message: the callers of this endpoint
 * are servers making one request at a time, and it is the shape the app this
 * replaced answered with.
 */
export function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request, { enableJsonResponse: true });
}
