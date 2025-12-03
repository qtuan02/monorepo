import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { env } from "../env";

let mcpClient: Client | null = null;

/**
 * Get or create MCP client instance
 */
export async function getMcpClient(): Promise<Client | null> {
  const mcpServerUrl = env.MCP_DOMAIN;

  if (!mcpServerUrl) {
    console.log(
      "[Assistant-AI] MCP_DOMAIN not configured, skipping MCP client",
    );
    return null;
  }

  if (!mcpClient) {
    try {
      console.log(
        "[Assistant-AI] Creating MCP client, connecting to:",
        mcpServerUrl,
      );
      mcpClient = new Client({
        name: "assistant-ai-client",
        version: "1.0.0",
      });

      const transport = new StreamableHTTPClientTransport(
        new URL(mcpServerUrl),
      );
      await mcpClient.connect(transport);
      console.log("[Assistant-AI] Successfully connected to MCP server");
    } catch (error) {
      console.error("[Assistant-AI] Failed to connect to MCP server:", error);
      mcpClient = null;
      return null;
    }
  }

  return mcpClient;
}

/**
 * List available tools from MCP server
 */
export async function listMcpTools() {
  const client = await getMcpClient();
  if (!client) {
    console.log(
      "[Assistant-AI] No MCP client available, returning empty tools list",
    );
    return { tools: [] };
  }

  try {
    console.log("[Assistant-AI] Listing MCP tools...");
    const result = await client.listTools();
    console.log(
      "[Assistant-AI] Found MCP tools:",
      result.tools.map((t) => t.name),
    );
    return result;
  } catch (error) {
    console.error("[Assistant-AI] Failed to list MCP tools:", error);
    return { tools: [] };
  }
}

/**
 * Call a tool on the MCP server
 */
export async function callMcpTool(name: string, args: Record<string, unknown>) {
  const client = await getMcpClient();
  if (!client) {
    throw new Error("MCP client not available");
  }

  try {
    console.log("[Assistant-AI] Calling MCP tool:", name, "with args:", args);
    const result = await client.callTool({
      name,
      arguments: args,
    });
    console.log("[Assistant-AI] MCP tool call successful:", name);
    console.log(
      "[Assistant-AI] Full result received:",
      JSON.stringify(result, null, 2),
    );
    console.log("[Assistant-AI] Result has content:", !!result.content);
    console.log(
      "[Assistant-AI] Result has structuredContent:",
      !!result.structuredContent,
    );
    if (result.content && Array.isArray(result.content)) {
      console.log(
        "[Assistant-AI] Result content length:",
        result.content.length,
      );
      result.content.forEach((item, index) => {
        console.log(
          `[Assistant-AI] Content item ${index}:`,
          JSON.stringify(item, null, 2),
        );
      });
    }
    if (result.structuredContent) {
      console.log(
        "[Assistant-AI] Structured content:",
        JSON.stringify(result.structuredContent, null, 2),
      );
    }
    return result;
  } catch (error) {
    console.error(`[Assistant-AI] Failed to call MCP tool ${name}:`, error);
    if (error instanceof Error) {
      console.error(`[Assistant-AI] Error message:`, error.message);
      console.error(`[Assistant-AI] Error stack:`, error.stack);
    }
    throw error;
  }
}
