import { initializeDiscordBot } from "~/libs/discord-bot";

/**
 * Keep-alive endpoint for Discord bot
 * This endpoint can be triggered manually to ensure
 * the bot stays connected to Discord's gateway
 */
export async function GET() {
  try {
    // Initialize or get existing client
    const client = await initializeDiscordBot();

    if (!client) {
      return new Response(
        JSON.stringify({
          status: "error",
          message:
            "Discord bot failed to initialize. Check DISCORD_TOKEN environment variable.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isReady = client.isReady();
    const user = client.user?.tag || null;
    const userId = client.user?.id || null;

    return new Response(
      JSON.stringify({
        status: isReady ? "ready" : "connecting",
        user,
        userId,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Keep-alive endpoint error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Allow POST as well for manual triggers
export const POST = GET;
