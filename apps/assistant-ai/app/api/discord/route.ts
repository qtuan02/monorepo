import { initializeDiscordBot } from "../../../libs/discord-bot";

// Export for Next.js API route
export async function GET() {
  // Ensure bot is initialized
  const client = await initializeDiscordBot();

  return new Response(
    JSON.stringify({
      status: client?.isReady() ? "ready" : "not ready",
      user: client?.user?.tag || null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
