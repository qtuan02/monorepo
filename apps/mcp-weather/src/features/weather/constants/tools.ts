/**
 * The three tool names this server has always exposed, with the title and
 * description a client reads out of `tools/list`.
 *
 * Data only — no zod schema and no SDK import — so the placeholder page can
 * render the same list the MCP server registers without pulling the protocol
 * SDK into a page bundle. `~/features/weather/server/mcp-server.ts` is what
 * joins each entry to its schemas and its handler.
 *
 * **These strings are the wire contract**, not UI copy: a client that has
 * already shipped calls `get-weather` by name and reads the English description
 * its model was prompted with. They are deliberately outside `@monorepo/i18n`
 * for that reason — translating them would change what the protocol returns.
 */
export const MCP_TOOL_NAMES = [
  "hello-world",
  "get-weather",
  "get-forecast",
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

interface McpToolDetail {
  title: string;
  description: string;
}

/**
 * Keyed by name rather than an array of `{ name, … }`, so
 * `MCP_TOOL_DETAILS[name]` is checked by the compiler at every registration
 * site. A lookup through the list would have to handle a miss at runtime, for a
 * key the type system already proves exists.
 */
export const MCP_TOOL_DETAILS: Record<McpToolName, McpToolDetail> = {
  "hello-world": {
    title: "Hello World",
    description: "Returns a simple Hello, World! message",
  },
  "get-weather": {
    title: "Get Current Weather",
    description: "Get current weather data for a city using OpenWeatherMap API",
  },
  "get-forecast": {
    title: "Get Weather Forecast",
    description:
      "Get 5-day weather forecast data for a city using OpenWeatherMap API",
  },
};

export interface McpToolSummary extends McpToolDetail {
  name: McpToolName;
}

/** The same three tools in registration order, for the placeholder page. */
export const MCP_TOOLS: readonly McpToolSummary[] = MCP_TOOL_NAMES.map(
  (name) => ({ name, ...MCP_TOOL_DETAILS[name] }),
);

/**
 * The path the endpoint is served at — one literal, README and page included.
 *
 * It lives here rather than in `~/constants/routes.ts` on purpose: that table
 * holds unprefixed paths handed to next-intl's `Link`, which would turn this one
 * into `/vi/api/mcp`. This path is never navigated, it is POSTed to by a client
 * outside the browser, and `src/app/api/mcp/route.ts` is the folder it has to
 * match — `test/features/weather/constants/tools.test.ts` pins that.
 */
export const MCP_ENDPOINT_PATH = "/api/mcp";
