import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";

import { MCP_TOOL_DETAILS } from "~/features/weather/constants/tools";
import {
  getCurrentWeather,
  getForecast,
} from "~/features/weather/server/openweathermap";
import {
  forecastOutputSchema,
  weatherOutputSchema,
} from "~/features/weather/types/weather";
import {
  formatForecastResponse,
  formatWeatherResponse,
} from "~/features/weather/utils/format-weather";

/**
 * The MCP server itself: three tools, no auth, exactly the contract the `mcp`
 * app in `legacy/` served — a client that already talks to this endpoint must
 * not have to change.
 *
 * A **factory**, not a module singleton. `Server.connect(transport)` binds one
 * transport at a time, so a module-level server shared by concurrent requests
 * would have the second request rebind the first one's transport mid-flight.
 * Stateless Streamable HTTP is one server + one transport per request, and
 * registering three tools costs nothing next to the HTTP call each one makes.
 */

/** Named once: both weather tools take the same optional unit argument. */
const unitsSchema = z
  .enum(["metric", "imperial", "standard"])
  // `.optional()` alongside `.default()` is redundant to a reader but is the
  // spelling the app this replaced advertised, and this schema is published in
  // `tools/list` — so it is kept verbatim rather than tidied.
  .optional()
  .default("metric")
  .describe(
    "Units of measurement: metric (Celsius), imperial (Fahrenheit), or standard (Kelvin)",
  );

const citySchema = z
  .string()
  .describe("City name (e.g., 'Ho Chi Minh City', 'London', 'New York')");

export function createWeatherMcpServer(): McpServer {
  const server = new McpServer({
    // Kept from the app this replaced: a client may key its own config on it.
    name: "tuan-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "hello-world",
    {
      ...MCP_TOOL_DETAILS["hello-world"],
      inputSchema: {},
      outputSchema: { message: z.string() },
    },
    () => {
      const output = { message: "Hello, World!" };

      return {
        content: [{ type: "text", text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    "get-weather",
    {
      ...MCP_TOOL_DETAILS["get-weather"],
      inputSchema: { city: citySchema, units: unitsSchema },
      outputSchema: weatherOutputSchema.shape,
    },
    async ({ city, units }) => {
      try {
        const weatherData = await getCurrentWeather(city, units);
        const { text, output } = formatWeatherResponse(weatherData, units);

        return {
          content: [{ type: "text", text }],
          structuredContent: output,
        };
      } catch (error) {
        // The prefix is part of what a client already reads on failure, so it is
        // kept word for word from the app this replaced. The SDK turns a throw
        // here into an in-band `isError` result rather than a transport error.
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        throw new Error(`Failed to get weather data: ${errorMessage}`);
      }
    },
  );

  server.registerTool(
    "get-forecast",
    {
      ...MCP_TOOL_DETAILS["get-forecast"],
      inputSchema: { city: citySchema, units: unitsSchema },
      outputSchema: forecastOutputSchema.shape,
    },
    async ({ city, units }) => {
      try {
        const forecastData = await getForecast(city, units);
        const { text, output } = formatForecastResponse(forecastData, units);

        return {
          content: [{ type: "text", text }],
          structuredContent: output,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        throw new Error(`Failed to get weather forecast: ${errorMessage}`);
      }
    },
  );

  return server;
}
