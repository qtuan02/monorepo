import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import {
  formatWeatherResponse,
  getCurrentWeather,
} from "~/utils/openweathermap";

// Create MCP server instance
const server = new McpServer({
  name: "hello-world-server",
  version: "1.0.0",
});

// Register hello-world tool
server.registerTool(
  "hello-world",
  {
    title: "Hello World",
    description: "Returns a simple Hello, World! message",
    inputSchema: {},
    outputSchema: {
      message: z.string(),
    },
  },
  async () => {
    const output = { message: "Hello, World!" };
    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output,
    };
  },
);

// Register weather tool
server.registerTool(
  "get-weather",
  {
    title: "Get Current Weather",
    description: "Get current weather data for a city using OpenWeatherMap API",
    inputSchema: {
      city: z
        .string()
        .describe("City name (e.g., 'Ho Chi Minh City', 'London', 'New York')"),
      units: z
        .enum(["metric", "imperial", "standard"])
        .optional()
        .default("metric")
        .describe(
          "Units of measurement: metric (Celsius), imperial (Fahrenheit), or standard (Kelvin)",
        ),
    },
    outputSchema: {
      city: z.string(),
      country: z.string(),
      temperature: z.number(),
      feelsLike: z.number(),
      description: z.string(),
      humidity: z.number(),
      pressure: z.number(),
      windSpeed: z.number(),
      visibility: z.number(),
    },
  },
  async ({ city, units = "metric" }) => {
    try {
      const weatherData = await getCurrentWeather(city, units);
      const { text, output } = formatWeatherResponse(weatherData, units);

      return {
        content: [{ type: "text", text }],
        structuredContent: output as unknown as Record<string, unknown>,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get weather data: ${errorMessage}`);
    }
  },
);

// Helper to convert Next.js Request to Node.js IncomingMessage-like object
function createIncomingMessage(req: Request): IncomingMessage {
  const url = new URL(req.url);
  const incomingMessage = {
    method: req.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(req.headers.entries()),
  } as unknown as IncomingMessage;

  return incomingMessage;
}

// Helper to create a ServerResponse that writes to a Response
function createServerResponse(): {
  serverResponse: ServerResponse;
  getResponse: () => Promise<Response>;
} {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  const bodyChunks: Uint8Array[] = [];
  let finished = false;
  let finishResolve: (() => void) | null = null;
  const eventListeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const serverResponse = {
    statusCode,
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    getHeader: (name: string) => headers[name.toLowerCase()],
    writeHead: (code: number, headers?: Record<string, string>) => {
      statusCode = code;
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          serverResponse.setHeader(key, value);
        });
      }
      // Return object with flushHeaders method
      return {
        ...serverResponse,
        flushHeaders: () => {
          // No-op for Next.js Response
        },
      };
    },
    write: (chunk: Uint8Array | string) => {
      if (typeof chunk === "string") {
        const encoder = new TextEncoder();
        bodyChunks.push(encoder.encode(chunk));
      } else {
        bodyChunks.push(chunk);
      }
      return true;
    },
    end: (chunk?: Uint8Array | string) => {
      if (chunk) {
        if (typeof chunk === "string") {
          const encoder = new TextEncoder();
          bodyChunks.push(encoder.encode(chunk));
        } else {
          bodyChunks.push(chunk);
        }
      }
      finished = true;
      // Trigger 'finish' event if listeners exist
      if (eventListeners.finish) {
        eventListeners.finish.forEach((listener) => listener());
      }
      // Resolve the finish promise if it exists
      if (finishResolve) {
        finishResolve();
      }
      return serverResponse;
    },
    on: (event: string, listener: (...args: unknown[]) => void) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(listener);
      return serverResponse;
    },
    once: (event: string, listener: (...args: unknown[]) => void) => {
      const onceWrapper = (...args: unknown[]) => {
        listener(...args);
        const listeners = eventListeners[event];
        if (listeners) {
          const index = listeners.indexOf(onceWrapper);
          if (index >= 0) {
            listeners.splice(index, 1);
          }
        }
      };
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(onceWrapper);
      return serverResponse;
    },
    removeListener: (event: string, listener: (...args: unknown[]) => void) => {
      const listeners = eventListeners[event];
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      }
      return serverResponse;
    },
    removeAllListeners: (event?: string) => {
      if (event) {
        delete eventListeners[event];
      } else {
        Object.keys(eventListeners).forEach((key) => {
          delete eventListeners[key];
        });
      }
      return serverResponse;
    },
    emit: (event: string, ...args: unknown[]) => {
      const listeners = eventListeners[event];
      if (listeners) {
        listeners.forEach((listener) => listener(...args));
      }
      return true;
    },
    flushHeaders: () => {
      // No-op for Next.js Response
    },
  } as unknown as ServerResponse;

  const getResponse = async () => {
    // Wait for the response to finish
    if (!finished) {
      await new Promise<void>((resolve) => {
        finishResolve = resolve;
        // Fallback timeout in case finish event doesn't fire
        setTimeout(() => {
          if (!finished) {
            finished = true;
            resolve();
          }
        }, 5000);
      });
    }

    const responseHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // Ensure Content-Type is set if not already set
    if (!responseHeaders.has("content-type")) {
      responseHeaders.set("content-type", "application/json");
    }

    // Combine all body chunks
    const totalLength = bodyChunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );
    const combinedBody = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of bodyChunks) {
      combinedBody.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert Uint8Array to string
    const responseBody =
      bodyChunks.length > 0 ? new TextDecoder().decode(combinedBody) : null;

    // If body is null, return empty string (transport will handle it)
    const finalBody = responseBody || "";

    return new Response(finalBody, {
      status: statusCode,
      headers: responseHeaders,
    });
  };

  return { serverResponse, getResponse };
}

// GET handler cho Cursor Connect (SSE stream)
export async function GET(req: Request) {
  try {
    // Create stateless transport for each request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: false, // GET requests may use SSE
    });

    await server.connect(transport);

    const incomingMessage = createIncomingMessage(req);
    const { serverResponse, getResponse } = createServerResponse();

    await transport.handleRequest(incomingMessage, serverResponse);

    const response = await getResponse();

    return response;
  } catch (error) {
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

export async function POST(req: Request) {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    // Parse body với better error handling
    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: { code: -32700, message: "Parse error" },
          id: null,
        },
        { status: 400 },
      );
    }

    const incomingMessage = createIncomingMessage(req);
    const { serverResponse, getResponse } = createServerResponse();

    await transport.handleRequest(incomingMessage, serverResponse, body);

    const response = await getResponse();

    // Read response body for logging
    const responseText = await response.text();

    // Check if response is valid JSON and log data
    try {
      const parsed = JSON.parse(responseText);
      console.log(
        "[MCP Server] Data returned:",
        JSON.stringify(parsed, null, 2),
      );
    } catch {
      // Not JSON, skip logging
    }

    // Return new Response with same body
    return new Response(responseText, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
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
