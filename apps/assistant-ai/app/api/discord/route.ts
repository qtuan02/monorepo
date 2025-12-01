import { getDiscordClient, initializeDiscordBot } from "~/libs/discord-bot";

// Export for Next.js API route
export async function GET() {
  try {
    // Try to get existing client first
    let client = getDiscordClient();

    // If no ready client, try to initialize
    if (!client) {
      client = await initializeDiscordBot();
    }

    const isReady = client?.isReady() ?? false;
    const user = client?.user?.tag || null;
    const userId = client?.user?.id || null;

    return new Response(
      JSON.stringify({
        status: isReady ? "ready" : "not ready",
        user,
        userId,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Discord status endpoint error:", error);
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
