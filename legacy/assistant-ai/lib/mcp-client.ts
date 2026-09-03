import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { env } from "../env";

// Try stateless pattern: create new client for each request
// This matches the stateless HTTP transport pattern used by MCP server

/**
 * Create a new MCP client instance for each request
 * Stateless HTTP transport requires new client per request
 */
async function createMcpClient(): Promise<Client | null> {
  const mcpServerUrl = `${env.MCP_DOMAIN}/api/mcp`;

  if (!mcpServerUrl) {
    return null;
  }

  try {
    const client = new Client({
      name: "assistant-ai-client",
      version: "1.0.0",
    });

    const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl));
    await client.connect(transport);
    return client;
  } catch {
    return null;
  }
}

/**
 * List available tools from MCP server
 */
export async function listMcpTools() {
  const client = await createMcpClient();
  if (!client) {
    return { tools: [] };
  }

  try {
    const result = await client.listTools();
    return result;
  } catch {
    return { tools: [] };
  } finally {
    // Close client after use (stateless pattern)
    try {
      await client.close();
    } catch {
      // Ignore close errors
    }
  }
}

/**
 * Call a tool on the MCP server
 */
export async function callMcpTool(name: string, args: Record<string, unknown>) {
  const client = await createMcpClient();
  if (!client) {
    throw new Error("MCP client not available");
  }

  try {
    const result = await client.callTool({
      name,
      arguments: args,
    });

    if (result.structuredContent) {
      console.log(
        "[Assistant-AI] Data returned:",
        JSON.stringify(result.structuredContent, null, 2),
      );
    } else if (result.content && Array.isArray(result.content)) {
      const textContent = result.content.find((c) => c.type === "text");
      if (textContent && "text" in textContent) {
        console.log("[Assistant-AI] Data returned:", textContent.text);
      }
    }

    return result;
  } finally {
    // Close client after use (stateless pattern)
    try {
      await client.close();
    } catch {
      // Ignore close errors
    }
  }
}
