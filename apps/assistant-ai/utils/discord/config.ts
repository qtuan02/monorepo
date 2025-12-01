import { env } from "~/env";

/**
 * Discord message character limit (Discord's maximum message length)
 */
export const DISCORD_MESSAGE_LIMIT = 2000;

/**
 * Maximum wait time (in milliseconds) for Discord client initialization
 */
export const INITIALIZATION_WAIT_TIME = 2000;

/**
 * Get the base URL for API calls
 *
 * @returns The base URL for the API. In production, uses NEXT_PUBLIC_ASSISTANT_AI_DOMAIN
 *          environment variable, otherwise defaults to http://localhost:3000 for local development.
 */
export function getApiBaseUrl(): string {
  if (env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN) {
    return env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN;
  }

  return "http://localhost:3000";
}

/**
 * Get the Discord bot token from environment variables
 *
 * @returns The Discord bot token, or null if not set
 */
export function getDiscordToken(): string | null {
  return env.DISCORD_TOKEN ?? null;
}
