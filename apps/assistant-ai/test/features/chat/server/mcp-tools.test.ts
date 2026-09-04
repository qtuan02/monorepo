// @vitest-environment node
//
// The rest of this app's suite runs on jsdom, where t3-env treats the process as
// a browser and refuses to hand out a `server` variable. This file reaches
// `ASSISTANT_AI_MCP_DOMAIN` and `GOOGLE_GENERATIVE_AI_API_KEY` through `~/env`, so it needs
// the environment where those reads are legal. Both values come from
// `vitest.config.ts` and are fake — the MCP SDK is mocked below, so nothing
// leaves the machine.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const listTools = vi.fn();
const callTool = vi.fn();
const connect = vi.fn<() => Promise<void>>();
const close = vi.fn<() => Promise<void>>();

/**
 * The seam is the MCP **client**, not `fetch`: what this module is responsible
 * for is the translation between one protocol's tool description and the other's
 * — which tools reach the model, what their schemas are, and what an `execute`
 * hands back. Stubbing the transport instead would only re-test the SDK.
 */
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: class {
    connect = connect;
    close = close;
    listTools = listTools;
    callTool = callTool;
  },
}));

vi.mock("@modelcontextprotocol/sdk/client/streamableHttp.js", () => ({
  StreamableHTTPClientTransport: class {
    constructor(public url: URL) {}
  },
}));

async function importLoadMcpTools() {
  vi.resetModules();
  const module = await import("~/features/chat/server/mcp-tools");
  return module.loadMcpTools;
}

beforeEach(() => {
  connect.mockResolvedValue(undefined);
  close.mockResolvedValue(undefined);
  listTools.mockResolvedValue({
    tools: [
      {
        name: "get-weather",
        description: "Current weather for a city",
        inputSchema: {
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"],
        },
      },
    ],
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("loadMcpTools", () => {
  it("offers every tool the server lists, under the server's own names", async () => {
    const loadMcpTools = await importLoadMcpTools();

    const { tools, close: closeTools } = await loadMcpTools();

    expect(Object.keys(tools)).toEqual(["get-weather"]);
    expect(tools["get-weather"]?.description).toBe(
      "Current weather for a city",
    );

    await closeTools();
    expect(close).toHaveBeenCalledOnce();
  });

  it("passes the tool's own JSON Schema through instead of rebuilding it", async () => {
    // The app this replaced walked the schema and re-expressed it as zod, losing
    // every constraint its walker did not recognise. Here the schema the model
    // is shown is the schema the server published, byte for byte.
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();

    expect(tools["get-weather"]?.inputSchema).toMatchObject({
      jsonSchema: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    });
  });

  it("gives the model the structured payload rather than the text block", async () => {
    callTool.mockResolvedValue({
      content: [{ type: "text", text: "Hà Nội: 30°C" }],
      structuredContent: { city: "Ha Noi", temperature: 30 },
    });
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();
    const result = await tools["get-weather"]?.execute?.(
      { city: "Ha Noi" },
      // The AI SDK hands `execute` a call context this tool does not read.
      {} as never,
    );

    expect(result).toEqual({ city: "Ha Noi", temperature: 30 });
  });

  it("falls back to the text block when there is no structured payload", async () => {
    callTool.mockResolvedValue({ content: [{ type: "text", text: "Hello!" }] });
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();

    expect(
      await tools["get-weather"]?.execute?.({ city: "Ha Noi" }, {} as never),
    ).toBe("Hello!");
  });

  it("returns a failed tool call as text, so the turn can carry on", async () => {
    // A throw here would end the whole turn with a stream error; a string lets
    // the model tell the visitor what went wrong and keep answering.
    callTool.mockRejectedValue(new Error("city not found"));
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();

    expect(
      await tools["get-weather"]?.execute?.({ city: "Nowhere" }, {} as never),
    ).toBe("Error executing get-weather: city not found");
  });

  it("degrades to a plain chat when ASSISTANT_AI_MCP_DOMAIN is unset", async () => {
    vi.stubEnv("ASSISTANT_AI_MCP_DOMAIN", "");
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();

    expect(tools).toEqual({});
    expect(connect).not.toHaveBeenCalled();
  });

  it("degrades to a plain chat when the MCP server cannot be reached", async () => {
    connect.mockRejectedValue(new Error("ECONNREFUSED"));
    const loadMcpTools = await importLoadMcpTools();

    const { tools } = await loadMcpTools();

    expect(tools).toEqual({});
  });
});
