import type { UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";

import { callMcpTool, listMcpTools } from "~/lib/mcp-client";

async function getMcpToolsForAiSdk() {
  const mcpToolsList = await listMcpTools();

  // Use any for tools object to allow different tool types
  const tools: Record<string, any> = {};

  for (const mcpTool of mcpToolsList.tools) {
    // Convert MCP tool schema to Zod schema
    const inputSchema = convertMcpSchemaToZod(mcpTool.inputSchema);

    // Type assertion needed due to dynamic schema conversion from MCP
    let toolDescription = mcpTool.description || mcpTool.name;

    // For get-weather tool, enhance description to encourage summary message
    if (mcpTool.name === "get-weather") {
      toolDescription = `${toolDescription}. IMPORTANT: After receiving the weather data result, you MUST generate a separate follow-up message that provides a user-friendly summary. Do NOT include the summary in the same message as the tool result.`;
    }

    tools[mcpTool.name] = tool({
      description: toolDescription,
      inputSchema: inputSchema as any,
      execute: async (args: Record<string, unknown>) => {
        try {
          const result = await callMcpTool(mcpTool.name, args);

          // For get-weather tool, return only structured data
          // The AI model will generate a separate summary message after receiving this data
          if (mcpTool.name === "get-weather") {
            if (result.structuredContent) {
              // Return only structured data - model will create summary separately
              return JSON.stringify(result.structuredContent, null, 2);
            }
            // Fallback to text if structuredContent not available
            if (
              result.content &&
              Array.isArray(result.content) &&
              result.content.length > 0
            ) {
              const textContent = result.content.find((c) => c.type === "text");
              if (textContent && "text" in textContent) {
                return textContent.text as string;
              }
            }
            return "Tool executed successfully";
          }

          // For other tools, use existing logic (text first, then structured)
          // Extract text content from MCP result
          if (
            result.content &&
            Array.isArray(result.content) &&
            result.content.length > 0
          ) {
            const textContent = result.content.find((c) => c.type === "text");
            if (textContent && "text" in textContent) {
              const text = textContent.text as string;
              return text;
            }
          }

          // Fallback to structured content if available
          if (result.structuredContent) {
            const structured = JSON.stringify(
              result.structuredContent,
              null,
              2,
            );

            return structured;
          }

          return "Tool executed successfully";
        } catch (error) {
          let errorMessage = "Unknown error";
          let errorDetails = "";

          if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.stack || "";

            // Parse JSON-related errors
            if (
              error.message.includes("JSON") ||
              error.message.includes("parse") ||
              error.message.includes("Unexpected")
            ) {
              errorMessage = `Failed to parse response from MCP server: ${error.message}`;
            }

            // Parse network-related errors
            if (
              error.message.includes("fetch") ||
              error.message.includes("network") ||
              error.message.includes("ECONNREFUSED")
            ) {
              errorMessage = `Network error connecting to MCP server: ${error.message}`;
            }

            console.error("[Assistant-AI] Error message:", errorMessage);
            if (errorDetails) {
              console.error("[Assistant-AI] Error stack:", errorDetails);
            }
          } else {
            console.error("[Assistant-AI] Non-Error object:", error);
            errorMessage = `Unexpected error: ${JSON.stringify(error)}`;
          }

          console.error("[Assistant-AI] ===== Tool Execute Error End =====");

          // Return user-friendly error message
          return `Error executing ${mcpTool.name}: ${errorMessage}`;
        }
      },
    });
  }

  return tools;
}

// Helper function to convert MCP JSON Schema to Zod schema
function convertMcpSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (typeof schema !== "object" || schema === null) {
    return z.any();
  }

  const jsonSchema = schema as Record<string, unknown>;

  // Handle object type with properties
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

  // Handle string type
  if (jsonSchema.type === "string") {
    return z.string();
  }

  // Handle number type
  if (jsonSchema.type === "number" || jsonSchema.type === "integer") {
    return z.number();
  }

  // Handle boolean type
  if (jsonSchema.type === "boolean") {
    return z.boolean();
  }

  // Handle array type
  if (jsonSchema.type === "array") {
    const items = convertMcpSchemaToZod(jsonSchema.items);
    return z.array(items);
  }

  // Handle enum
  if (Array.isArray(jsonSchema.enum)) {
    return z.enum(jsonSchema.enum as [string, ...string[]]);
  }

  // Handle oneOf/anyOf (use first option as fallback)
  if (Array.isArray(jsonSchema.oneOf)) {
    const firstOption = convertMcpSchemaToZod(jsonSchema.oneOf[0]);
    return firstOption;
  }

  if (Array.isArray(jsonSchema.anyOf)) {
    const firstOption = convertMcpSchemaToZod(jsonSchema.anyOf[0]);
    return firstOption;
  }

  return z.any();
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get MCP tools and convert to AI SDK format
  const mcpTools = await getMcpToolsForAiSdk();

  // Check if get-weather tool is available
  const hasWeatherTool = Object.keys(mcpTools).includes("get-weather");

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    tools: Object.keys(mcpTools).length > 0 ? mcpTools : undefined,
    // Allow multiple steps to enable follow-up summary message after tool execution
    stopWhen: hasWeatherTool ? stepCountIs(3) : undefined,
    system: hasWeatherTool
      ? "CRITICAL INSTRUCTION: When you call the get-weather tool and receive the weather data, you MUST immediately generate a SEPARATE follow-up message that provides a user-friendly summary. The summary message must be in a completely separate message from the tool result. Use the same language as the user's query. The summary should be concise and highlight key weather information like temperature, condition, and location."
      : undefined,
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
