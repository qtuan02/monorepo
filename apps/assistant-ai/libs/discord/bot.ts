import { Client, GatewayIntentBits } from "discord.js";

import {
  getClientInstance,
  getDiscordClient,
  getInitializationStatus,
  setDiscordClient,
  setInitializationStatus,
} from "~/utils/discord/client-manager";
import {
  getDiscordToken,
  INITIALIZATION_WAIT_TIME,
} from "~/utils/discord/config";
import { registerDiscordEventHandlers } from "~/utils/discord/event-handlers";

/**
 * Initializes the Discord bot client
 *
 * This function handles the complete initialization process:
 * - Checks if client is already ready
 * - Waits for ongoing initialization if needed
 * - Creates a new client with required intents
 * - Registers event handlers
 * - Logs in to Discord
 *
 * @returns A promise that resolves to the initialized Discord client, or null if initialization fails
 */
export async function initializeDiscordBot(): Promise<Client | null> {
  const existingClient = getClientInstance();
  const isInitialized = getInitializationStatus();

  // If client exists and is ready, return it
  if (isInitialized && existingClient?.isReady()) {
    return existingClient;
  }

  // If already initializing, wait a bit and check again
  if (isInitialized && existingClient && !existingClient.isReady()) {
    console.log("Discord client is initializing, waiting...");
    await new Promise((resolve) =>
      setTimeout(resolve, INITIALIZATION_WAIT_TIME),
    );

    if (existingClient.isReady()) {
      return existingClient;
    }
  }

  // Check if Discord token is available
  const token = getDiscordToken();
  if (!token) {
    console.error("DISCORD_TOKEN is not set");
    return null;
  }

  // Mark as initialized to prevent concurrent initialization attempts
  setInitializationStatus(true);

  // Create new Discord client with required intents
  const newClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Register all event handlers BEFORE login
  registerDiscordEventHandlers(newClient);

  try {
    // Login to Discord
    await newClient.login(token);

    // Store the client instance
    setDiscordClient(newClient);

    console.log("Discord bot initialization complete");
    return newClient;
  } catch (error) {
    console.error("Failed to login to Discord:", error);
    setInitializationStatus(false);
    setDiscordClient(null);
    return null;
  }
}

/**
 * Gets the ready Discord client instance
 *
 * @returns The ready Discord client, or null if not available or not ready
 */
export { getDiscordClient };

// Auto-initialize when module is loaded (server-side only)
if (typeof window === "undefined") {
  void initializeDiscordBot();
}
