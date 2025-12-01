import type { Client } from "discord.js";

/**
 * Global Discord client instance
 */
let client: Client | null = null;

/**
 * Flag to track if Discord bot initialization has been attempted
 */
let isInitialized = false;

/**
 * Gets the current Discord client if it's ready
 *
 * @returns The ready Discord client, or null if not available or not ready
 */
export function getDiscordClient(): Client | null {
  if (client?.isReady()) {
    return client;
  }
  return null;
}

/**
 * Gets the current Discord client regardless of ready state
 *
 * @returns The Discord client instance, or null if not initialized
 */
export function getClientInstance(): Client | null {
  return client;
}

/**
 * Sets the Discord client instance
 *
 * @param newClient - The Discord client to set
 */
export function setDiscordClient(newClient: Client | null): void {
  client = newClient;
}

/**
 * Checks if the Discord bot has been initialized
 *
 * @returns True if initialization has been attempted, false otherwise
 */
export function getInitializationStatus(): boolean {
  return isInitialized;
}

/**
 * Sets the initialization status
 *
 * @param status - The initialization status to set
 */
export function setInitializationStatus(status: boolean): void {
  isInitialized = status;
}

/**
 * Resets the client manager state (useful for testing or error recovery)
 */
export function resetClientManager(): void {
  client = null;
  isInitialized = false;
}
