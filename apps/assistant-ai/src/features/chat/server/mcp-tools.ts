import type { ToolSet } from "ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { jsonSchema, tool } from "ai";

import { env } from "~/env";
import { MCP_ENDPOINT_PATH } from "../constants/endpoints";

/**
 * Borrows the MCP server's tools for one chat turn.
 *
 * The client is created and closed per request, because the server it talks to
 * (`apps/mcp-weather`) is **stateless**: it mints no `Mcp-Session-Id`, so there
 * is nothing to keep between calls and a module-level client would only be a
 * connection to leak. This is the same reasoning that makes the server side a
 * factory rather than a singleton.
 *
 * The same `@modelcontextprotocol/sdk` is on both ends of the wire, on purpose:
 * the two apps ship from one catalog entry, so the client cannot drift onto a
 * protocol version the server does not speak.
 */
async function connectMcpClient(): Promise<Client | undefined> {
  if (!env.ASSISTANT_AI_MCP_DOMAIN) return undefined;

  const client = new Client({ name: "assistant-ai-client", version: "1.0.0" });

  try {
    await client.connect(
      new StreamableHTTPClientTransport(
        new URL(MCP_ENDPOINT_PATH, env.ASSISTANT_AI_MCP_DOMAIN),
      ),
    );
    return client;
  } catch {
    // An unreachable MCP server degrades this app to a plain chat rather than
    // failing the turn: the model is what the visitor came for, the tools are
    // an addition. The reason is on the server's side and there is nothing the
    // visitor can do about it, so it does not become a chat error.
    return undefined;
  }
}

async function closeQuietly(client: Client): Promise<void> {
  try {
    await client.close();
  } catch {
    // The turn is already answered; a transport that will not close cleanly is
    // not something to fail it over.
  }
}

/**
 * The MCP tools, converted to the AI SDK's shape, plus the closer for the
 * connection they are bound to. The caller **must** await `close()` once the
 * stream has finished — a tool's `execute` runs long after this function
 * returned.
 *
 * Every tool's input schema crosses over as **JSON Schema**, which is what MCP
 * speaks and what `jsonSchema()` accepts directly. The app this replaced walked
 * the schema and rebuilt it as zod — 130 lines that silently dropped every
 * constraint zod could not express and fell back to `z.any()` for anything
 * unrecognised, so a required enum reached the model as "anything goes".
 */
export async function loadMcpTools(): Promise<{
  tools: ToolSet;
  close: () => Promise<void>;
}> {
  const client = await connectMcpClient();

  if (!client) {
    return { tools: {}, close: async () => undefined };
  }

  try {
    const { tools: definitions } = await client.listTools();

    const tools = Object.fromEntries(
      definitions.map((definition) => [
        definition.name,
        tool({
          description: definition.description ?? definition.name,
          inputSchema: jsonSchema(definition.inputSchema),
          execute: (args: unknown) =>
            callMcpTool(client, definition.name, args),
        }),
      ]),
    );

    return { tools, close: () => closeQuietly(client) };
  } catch {
    await closeQuietly(client);
    return { tools: {}, close: async () => undefined };
  }
}

/**
 * Runs one tool and returns what the model should read.
 *
 * `structuredContent` is preferred over the text block whenever the server sends
 * it: it is the payload the tool's `outputSchema` describes, so the model gets
 * named fields instead of a pre-formatted paragraph it would have to parse back.
 * A failure comes back as a string rather than a throw, so the model can tell
 * the visitor what went wrong and carry on — an exception here would end the
 * whole turn.
 */
async function callMcpTool(
  client: Client,
  name: string,
  args: unknown,
): Promise<unknown> {
  try {
    const result = await client.callTool({
      name,
      arguments: (args ?? {}) as Record<string, unknown>,
    });

    if (result.structuredContent !== undefined) return result.structuredContent;

    if (Array.isArray(result.content)) {
      const text = result.content.find((part) => part.type === "text");
      if (text && typeof text.text === "string") return text.text;
    }

    return "Tool executed successfully";
  } catch (error) {
    return `Error executing ${name}: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}
