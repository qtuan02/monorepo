import { getDiscordClient, initializeDiscordBot } from "~/libs/discord/bot";

/**
 * Discord bot status response type
 */
interface DiscordStatusResponse {
  status: "ready" | "not ready" | "error";
  user: string | null;
  userId: string | null;
  message?: string;
  timestamp: string;
}

/**
 * Creates a JSON response with the Discord bot status
 *
 * @param data - The status data to send
 * @param statusCode - HTTP status code (default: 200)
 * @returns A Response object with JSON content
 */
function createJsonResponse(
  data: DiscordStatusResponse,
  statusCode = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * GET /api/discord
 *
 * Returns the current status of the Discord bot, including:
 * - Connection status (ready/not ready)
 * - Bot user information (tag and ID)
 * - Timestamp of the status check
 *
 * If the bot is not initialized, attempts to initialize it.
 *
 * @returns A JSON response with bot status information
 */
export async function GET(): Promise<Response> {
  try {
    // Try to get existing ready client first
    let client = getDiscordClient();

    // If no ready client, try to initialize
    if (!client) {
      client = await initializeDiscordBot();
    }

    const isReady = client?.isReady() ?? false;
    const user = client?.user?.tag ?? null;
    const userId = client?.user?.id ?? null;

    return createJsonResponse({
      status: isReady ? "ready" : "not ready",
      user,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Discord status endpoint error:", error);

    return createJsonResponse(
      {
        status: "error",
        user: null,
        userId: null,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
}
