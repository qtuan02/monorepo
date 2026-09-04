/**
 * Where the MCP server exposes its endpoint, relative to `MCP_DOMAIN`.
 *
 * A literal rather than an import from `apps/mcp-weather`: the two apps are
 * separate deployments joined by a URL, and a backend outside this repo calls
 * the same path (see `apps/mcp-weather/README.md`). Changing it is a wire-
 * contract change on both sides, not a refactor.
 */
export const MCP_ENDPOINT_PATH = "/api/mcp";

/**
 * This app's own chat endpoint. The transport in `chat.template.tsx` posts here
 * and `src/app/api/chat/route.ts` answers; both read this constant so a rename
 * cannot leave one of them behind.
 */
export const CHAT_API_PATH = "/api/chat";
