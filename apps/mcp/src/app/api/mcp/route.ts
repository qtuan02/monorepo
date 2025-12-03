import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import type { CurrentWeatherOutput, ForecastOutput } from "~/types/weather";
import {
  getCurrentWeather,
  getForecast,
  transformCurrentWeather,
  transformForecast,
} from "~/lib/openweathermap";

// Create a singleton MCP server instance
// This is safe to reuse across requests as it's stateless
let mcpServer: McpServer | null = null;

/**
 * Get or create the MCP server instance
 * Based on MCP TypeScript SDK best practices
 */
function getMcpServer(): McpServer {
  if (!mcpServer) {
    mcpServer = new McpServer({
      name: "weather-mcp-server",
      version: "1.0.0",
    });

    // Register get-current-weather tool
    mcpServer.registerTool(
      "get-current-weather",
      {
        title: "Get Current Weather",
        description:
          "Get current weather data for a city including temperature, humidity, wind speed, and weather conditions",
        inputSchema: z.object({
          city: z
            .string()
            .min(1)
            .describe(
              "City name (e.g., 'London', 'New York', 'Tokyo', 'Hồ Chí Minh')",
            ),
          units: z
            .enum(["metric", "imperial", "standard"])
            .optional()
            .default("metric")
            .describe(
              "Units of measurement. metric for Celsius, imperial for Fahrenheit",
            ),
          lang: z
            .string()
            .optional()
            .describe(
              "Language code for weather descriptions (e.g., 'vi' for Vietnamese, 'en' for English). Default: 'vi' for Vietnamese cities, 'en' otherwise.",
            ),
        }),
        outputSchema: z.object({
          city: z.string(),
          country: z.string(),
          temperature: z.number(),
          feelsLike: z.number(),
          tempMin: z.number(),
          tempMax: z.number(),
          humidity: z.number(),
          pressure: z.number(),
          windSpeed: z.number(),
          windDirection: z.number(),
          description: z.string(),
          main: z.string(),
          visibility: z.number(),
          clouds: z.number(),
        }),
      },
      async ({ city, units = "metric", lang }) => {
        try {
          // Auto-detect Vietnamese language if city name contains Vietnamese characters
          const vietnameseRegex =
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
          const detectedLang =
            lang || (vietnameseRegex.exec(city) ? "vi" : undefined);

          const data = await getCurrentWeather(
            city.trim(),
            units,
            detectedLang,
          );

          const output: CurrentWeatherOutput = transformCurrentWeather(data);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(output, null, 2),
              },
            ],
            structuredContent: output as unknown as Record<string, unknown>,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            "[MCP Server] Error in get-current-weather:",
            errorMessage,
          );
          return {
            content: [
              {
                type: "text",
                text: `Error: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // Register get-weather-forecast tool
    mcpServer.registerTool(
      "get-weather-forecast",
      {
        title: "Get Weather Forecast",
        description:
          "Get 5-day weather forecast for a city with detailed hourly predictions",
        inputSchema: z.object({
          city: z
            .string()
            .min(1)
            .describe(
              "City name (e.g., 'London', 'New York', 'Tokyo', 'Hồ Chí Minh')",
            ),
          units: z
            .enum(["metric", "imperial", "standard"])
            .optional()
            .default("metric")
            .describe(
              "Units of measurement. metric for Celsius, imperial for Fahrenheit",
            ),
          lang: z
            .string()
            .optional()
            .describe(
              "Language code for weather descriptions (e.g., 'vi' for Vietnamese, 'en' for English). Default: 'vi' for Vietnamese cities, 'en' otherwise.",
            ),
        }),
        outputSchema: z.object({
          city: z.string(),
          country: z.string(),
          forecast: z.array(
            z.object({
              date: z.string(),
              temperature: z.number(),
              feelsLike: z.number(),
              tempMin: z.number(),
              tempMax: z.number(),
              humidity: z.number(),
              pressure: z.number(),
              windSpeed: z.number(),
              windDirection: z.number(),
              description: z.string(),
              main: z.string(),
              clouds: z.number(),
              pop: z.number(),
            }),
          ),
        }),
      },
      async ({ city, units = "metric", lang }) => {
        try {
          // Auto-detect Vietnamese language if city name contains Vietnamese characters
          const vietnameseRegex =
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
          const detectedLang =
            lang || (vietnameseRegex.exec(city) ? "vi" : undefined);

          const data = await getForecast(city.trim(), units, detectedLang);

          const output: ForecastOutput = transformForecast(data);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(output, null, 2),
              },
            ],
            structuredContent: output as unknown as Record<string, unknown>,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(
            "[MCP Server] Error in get-weather-forecast:",
            errorMessage,
          );
          return {
            content: [
              {
                type: "text",
                text: `Error: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  return mcpServer;
}

/**
 * Create Express-like request/response adapter for Next.js
 * This adapter allows the MCP transport to work with Next.js Request/Response
 * Based on MCP TypeScript SDK best practices
 */
function createExpressAdapter(req: Request) {
  let responseData: unknown = null;
  let statusCode = 200;
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");
  let headersSent = false;

  // Ensure Accept header includes required types for MCP protocol
  const originalAccept = req.headers.get("accept");
  const acceptHeader =
    originalAccept &&
    (originalAccept.includes("application/json") ||
      originalAccept.includes("text/event-stream") ||
      originalAccept.includes("*/*"))
      ? originalAccept
      : "application/json, text/event-stream";

  // Create headers object compatible with Express
  const headersObj: Record<string, string> = {
    accept: acceptHeader,
  };

  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey !== "accept") {
      headersObj[lowerKey] = value;
      headersObj[key] = value;
    }
  });

  const headers = new Proxy(
    {
      get: (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName === "accept") {
          return acceptHeader;
        }
        return headersObj[lowerName] || req.headers.get(name);
      },
    },
    {
      get: (target, prop: string | symbol) => {
        if (typeof prop === "string") {
          const lowerProp = prop.toLowerCase();
          if (prop === "get") {
            return target.get;
          }
          if (lowerProp === "accept") {
            return acceptHeader;
          }
          return (
            headersObj[lowerProp] || headersObj[prop] || req.headers.get(prop)
          );
        }
        return undefined;
      },
      has: (target, prop: string | symbol) => {
        if (typeof prop === "string") {
          const lowerProp = prop.toLowerCase();
          return (
            lowerProp === "accept" ||
            lowerProp === "get" ||
            Object.prototype.hasOwnProperty.call(headersObj, lowerProp)
          );
        }
        return false;
      },
    },
  );

  const expressReq = {
    method: req.method,
    url: req.url,
    headers,
    body: null as unknown,
  };

  const expressRes = {
    status: (code: number) => {
      statusCode = code;
      return expressRes;
    },
    json: (data: unknown) => {
      if (!headersSent) {
        responseData = data;
        responseHeaders.set("Content-Type", "application/json");
        headersSent = true;
      }
      return expressRes;
    },
    setHeader: (name: string, value: string) => {
      responseHeaders.set(name, value);
    },
    getHeader: (name: string) => {
      const headerName = name.toLowerCase();
      if (headerName === "content-type") {
        return responseHeaders.get("Content-Type") || "application/json";
      }
      return responseHeaders.get(name) || undefined;
    },
    getHeaders: () => {
      const headers: Record<string, string> = {};
      responseHeaders.forEach((value, key) => {
        headers[key] = value;
      });
      if (!headers["content-type"] && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      return headers;
    },
    writeHead: (code: number, headers?: Record<string, string>) => {
      if (!headersSent) {
        statusCode = code;
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            responseHeaders.set(key, value);
          });
        }
        if (!responseHeaders.has("Content-Type")) {
          responseHeaders.set("Content-Type", "application/json");
        }
        headersSent = true;
      }
      return expressRes;
    },
    write: (chunk: string | Uint8Array) => {
      if (typeof chunk === "string") {
        try {
          responseData = JSON.parse(chunk);
        } catch {
          responseData = chunk;
        }
      } else {
        const decoded = new TextDecoder().decode(chunk);
        try {
          responseData = JSON.parse(decoded);
        } catch {
          responseData = decoded;
        }
      }
      if (!responseHeaders.has("Content-Type")) {
        responseHeaders.set("Content-Type", "application/json");
      }
      return true;
    },
    end: (chunk?: string | Uint8Array) => {
      if (chunk) {
        if (typeof chunk === "string") {
          try {
            responseData = JSON.parse(chunk);
          } catch {
            responseData = chunk;
          }
        } else {
          const decoded = new TextDecoder().decode(chunk);
          try {
            responseData = JSON.parse(decoded);
          } catch {
            responseData = decoded;
          }
        }
      }
      if (!responseHeaders.has("Content-Type")) {
        responseHeaders.set("Content-Type", "application/json");
      }
      headersSent = true;
      return expressRes;
    },
    on: (event: string, callback: () => void) => {
      if (event === "close") {
        req.signal.addEventListener("abort", callback);
      }
    },
    headersSent,
  } as any;

  return {
    req: expressReq,
    res: expressRes,
    getResponse: () => ({
      data: responseData,
      status: statusCode,
      headers: responseHeaders,
    }),
  };
}

/**
 * POST handler for MCP protocol requests
 * Based on MCP TypeScript SDK best practices for stateless HTTP transport
 */
export async function POST(req: Request) {
  const server = getMcpServer();

  // In stateless mode, create a new transport for each request
  // This prevents request ID collisions between different clients
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);

    const {
      req: expressReq,
      res: expressRes,
      getResponse,
    } = createExpressAdapter(req);

    // Handle request close/abort
    req.signal.addEventListener("abort", () => {
      transport.close();
    });

    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      console.error("[MCP Server] Failed to parse request body:", error);
      return Response.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32700,
            message: "Parse error",
          },
          id: null,
        },
        { status: 400 },
      );
    }

    // Validate JSON-RPC 2.0 request
    if (
      typeof body !== "object" ||
      body === null ||
      !("jsonrpc" in body) ||
      (body as { jsonrpc?: unknown }).jsonrpc !== "2.0"
    ) {
      console.error("[MCP Server] Invalid JSON-RPC request:", body);
      return Response.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32600,
            message: "Invalid Request",
          },
          id: (body as { id?: unknown })?.id ?? null,
        },
        { status: 400 },
      );
    }

    expressReq.body = body;

    // Handle the MCP request through transport
    await transport.handleRequest(expressReq as any, expressRes, body);

    // Small delay to ensure all async operations complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // If transport already sent response, return empty response
    if (expressRes.headersSent) {
      return new Response(null, { status: 200 });
    }

    // Get response data from adapter
    const { data, status, headers } = getResponse();

    // Ensure Content-Type is set
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Get request ID for response
    const requestId = (body as { id?: string | number | null })?.id;

    // Format response as JSON-RPC 2.0
    let responseData: unknown = data;

    if (typeof data === "object" && data !== null) {
      // Check if already valid JSON-RPC 2.0
      if (
        "jsonrpc" in data &&
        (data as { jsonrpc?: unknown }).jsonrpc === "2.0"
      ) {
        const rpcResponse = data as {
          jsonrpc: string;
          result?: unknown;
          error?: unknown;
          id?: string | number | null;
        };
        // Ensure id is set
        if (
          (rpcResponse.id === null || rpcResponse.id === undefined) &&
          requestId !== undefined
        ) {
          rpcResponse.id = requestId;
        }
        responseData = rpcResponse;
      } else if ("result" in data || "error" in data) {
        // Has result/error but missing jsonrpc - complete the format
        responseData = {
          jsonrpc: "2.0",
          ...data,
          id: requestId ?? null,
        };
      } else {
        // Wrap non-JSON-RPC data
        responseData = {
          jsonrpc: "2.0",
          result: data,
          id: requestId ?? null,
        };
      }
    } else {
      // Wrap non-object data
      responseData = {
        jsonrpc: "2.0",
        result: data ?? null,
        id: requestId ?? null,
      };
    }

    // Final validation
    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "jsonrpc" in responseData
    ) {
      const finalResponse = responseData as {
        jsonrpc: string;
        result?: unknown;
        error?: unknown;
        id?: string | number | null;
      };

      if (finalResponse.jsonrpc !== "2.0") {
        finalResponse.jsonrpc = "2.0";
      }

      if (finalResponse.id === undefined) {
        finalResponse.id = requestId ?? null;
      }

      if (!("result" in finalResponse) && !("error" in finalResponse)) {
        finalResponse.result = null;
      }

      responseData = finalResponse;
    }

    return new Response(JSON.stringify(responseData), {
      status,
      headers: Object.fromEntries(headers.entries()),
    });
  } catch (error) {
    console.error("[MCP Server] Error:", error);
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        id: null,
      },
      { status: 500 },
    );
  }
}
