import type { UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, tool } from "ai";
import { z } from "zod";

import { callMcpTool, listMcpTools } from "~/lib/mcp-client";

async function getMcpToolsForAiSdk() {
  console.log("[Assistant-AI] Getting MCP tools for AI SDK...");
  const mcpToolsList = await listMcpTools();
  // Use any for tools object to allow different tool types

  const tools: Record<string, any> = {};

  console.log(
    "[Assistant-AI] Converting",
    mcpToolsList.tools.length,
    "MCP tools to AI SDK format",
  );
  for (const mcpTool of mcpToolsList.tools) {
    // Convert MCP tool schema to Zod schema
    const inputSchema = convertMcpSchemaToZod(mcpTool.inputSchema);

    // Type assertion needed due to dynamic schema conversion from MCP

    tools[mcpTool.name] = tool({
      description: mcpTool.description || mcpTool.name,

      inputSchema: inputSchema as any,
      execute: async (args: Record<string, unknown>) => {
        console.log(
          "[Assistant-AI] Executing tool:",
          mcpTool.name,
          "with args:",
          args,
        );
        try {
          const result = await callMcpTool(mcpTool.name, args);

          // Extract text content from MCP result
          if (
            result.content &&
            Array.isArray(result.content) &&
            result.content.length > 0
          ) {
            const textContent = result.content.find((c) => c.type === "text");
            if (textContent && "text" in textContent) {
              console.log(
                "[Assistant-AI] Returning text content from tool:",
                mcpTool.name,
              );
              return textContent.text as string;
            }
          }

          // Fallback to structured content if available
          if (result.structuredContent) {
            console.log(
              "[Assistant-AI] Returning structured content from tool:",
              mcpTool.name,
            );
            return JSON.stringify(result.structuredContent, null, 2);
          }

          console.log(
            "[Assistant-AI] Tool executed but no content found:",
            mcpTool.name,
          );
          return "Tool executed successfully";
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            "[Assistant-AI] Error executing tool:",
            mcpTool.name,
            errorMessage,
          );
          return `Error: ${errorMessage}`;
        }
      },
    });
  }

  console.log("[Assistant-AI] Converted tools:", Object.keys(tools));
  return tools;
}

// Helper function to convert MCP JSON Schema to Zod schema
function convertMcpSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (typeof schema !== "object" || schema === null) {
    return z.any();
  }

  const jsonSchema = schema as Record<string, unknown>;

  if (jsonSchema.type === "object" && jsonSchema.properties) {
    const shape: Record<string, z.ZodTypeAny> = {};
    const properties = jsonSchema.properties as Record<string, unknown>;
    const required = (jsonSchema.required as string[]) || [];

    for (const [key, value] of Object.entries(properties)) {
      const fieldSchema = convertMcpSchemaToZod(value);
      shape[key] = required.includes(key)
        ? fieldSchema
        : fieldSchema.optional();
    }

    return z.object(shape);
  }

  if (jsonSchema.type === "string") {
    return z.string();
  }

  if (jsonSchema.type === "number") {
    return z.number();
  }

  if (jsonSchema.type === "boolean") {
    return z.boolean();
  }

  if (jsonSchema.type === "array") {
    const items = convertMcpSchemaToZod(jsonSchema.items);
    return z.array(items);
  }

  // Handle enum
  if (Array.isArray(jsonSchema.enum)) {
    return z.enum(jsonSchema.enum as [string, ...string[]]);
  }

  return z.any();
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log(
    "[Assistant-AI] Chat request received, messages count:",
    messages.length,
  );

  // Get MCP tools and convert to AI SDK format
  const mcpTools = await getMcpToolsForAiSdk();
  console.log(
    "[Assistant-AI] MCP tools available:",
    Object.keys(mcpTools).length,
  );

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    tools: Object.keys(mcpTools).length > 0 ? mcpTools : undefined,
  });

  console.log("[Assistant-AI] Streaming response started");
  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
