import type { Client, Message } from "discord.js";

import { handleDiscordMessage } from "./message-handler";

/**
 * Registers all Discord event handlers on the client
 *
 * @param client - The Discord client to register handlers on
 */
export function registerDiscordEventHandlers(client: Client): void {
  // Bot ready event
  client.on("ready", () => {
    console.log(`Discord bot logged in as ${client.user?.tag}!`);
    console.log(`Bot ID: ${client.user?.id}`);
  });

  // Message create event
  client.on("messageCreate", (msg: Message) => {
    void handleDiscordMessage(msg, client);
  });

  // Error event
  client.on("error", (error) => {
    console.error("Discord client error:", error);
  });

  // Disconnect event
  client.on("disconnect", () => {
    console.warn("Discord client disconnected");
  });

  // Shard ready event
  client.on("shardReady", (shardId) => {
    console.log(`Discord shard ${shardId} is ready`);
  });
}
