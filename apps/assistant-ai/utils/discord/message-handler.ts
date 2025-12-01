import type { Client, Message } from "discord.js";

import { callChatAPI } from "./api-client";
import { DISCORD_MESSAGE_LIMIT } from "./config";

/**
 * Removes bot mentions from message content
 *
 * @param content - The original message content
 * @returns The cleaned message content without bot mentions
 */
function cleanMessageContent(content: string): string {
  return content.replace(/<@\d+>/g, "").trim();
}

/**
 * Estimates the maximum length of a part indicator (e.g., "📝 (99/99)\n\n")
 * Used to reserve space when splitting chunks
 */
const MAX_INDICATOR_LENGTH = 20; // Safe estimate for "📝 (99/99)\n\n"

/**
 * Splits text into chunks that fit within Discord's message limit
 *
 * Each chunk will be at most DISCORD_MESSAGE_LIMIT characters.
 * When there are multiple chunks, reserves space for the part indicator.
 * The function tries to split at word boundaries when possible to avoid breaking words.
 *
 * @param text - The text to split into chunks
 * @returns An array of text chunks, each within the Discord message limit
 */
function splitTextIntoChunks(text: string): string[] {
  if (text.length <= DISCORD_MESSAGE_LIMIT) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;
  let chunkIndex = 0;

  while (remaining.length > 0) {
    // Reserve space for indicator if this won't be the only chunk
    // First chunk might not need indicator if it's the only one, but we'll add it if needed
    const maxChunkSize =
      chunkIndex === 0 && remaining.length <= DISCORD_MESSAGE_LIMIT
        ? DISCORD_MESSAGE_LIMIT
        : DISCORD_MESSAGE_LIMIT - MAX_INDICATOR_LENGTH;

    if (remaining.length <= maxChunkSize) {
      chunks.push(remaining);
      break;
    }

    // Try to find a good split point (prefer word boundaries)
    let splitIndex = maxChunkSize;

    // Look for a newline character near the limit
    const newlineIndex = remaining.lastIndexOf("\n", maxChunkSize);
    if (newlineIndex > maxChunkSize * 0.8) {
      splitIndex = newlineIndex + 1;
    } else {
      // Look for a space near the limit
      const spaceIndex = remaining.lastIndexOf(" ", maxChunkSize);
      if (spaceIndex > maxChunkSize * 0.8) {
        splitIndex = spaceIndex + 1;
      }
    }

    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex);
    chunkIndex++;
  }

  return chunks;
}

/**
 * Formats a chunk with part indicator (e.g., "📝 (1/3)")
 *
 * @param chunk - The text chunk
 * @param currentPart - Current part number (1-based)
 * @param totalParts - Total number of parts
 * @returns Formatted text with part indicator
 */
function formatChunkWithIndicator(
  chunk: string,
  currentPart: number,
  totalParts: number,
): string {
  if (totalParts === 1) {
    return chunk;
  }

  const indicator = `📝 (${currentPart}/${totalParts})\n\n`;
  const availableSpace = DISCORD_MESSAGE_LIMIT - indicator.length;

  // Ensure chunk fits with indicator (chunk should already be <= availableSpace from splitTextIntoChunks)
  // But add safety check just in case
  if (chunk.length > availableSpace) {
    console.warn(
      `Chunk ${currentPart} is too long (${chunk.length} chars), truncating to fit with indicator`,
    );
    return indicator + chunk.substring(0, availableSpace - 3) + "...";
  }

  return indicator + chunk;
}

/**
 * Checks if the bot is mentioned in the message
 *
 * @param message - The Discord message to check
 * @param botUser - The bot's user object
 * @returns True if the bot is mentioned, false otherwise
 */
function isBotMentioned(
  message: Message,
  botUser: NonNullable<Client["user"]>,
): boolean {
  return message.mentions.has(botUser);
}

/**
 * Handles a Discord message and generates a response
 *
 * @param message - The Discord message to process
 * @param client - The Discord client instance
 */
export async function handleDiscordMessage(
  message: Message,
  client: Client,
): Promise<void> {
  // Ignore messages from bots
  if (message.author.bot) {
    return;
  }

  // Check if bot user exists
  if (!client.user) {
    return;
  }

  // Debug: Log messages with mentions
  if (message.mentions.users.size > 0) {
    console.log(
      `Message received with mentions: ${message.mentions.users.map((u) => u.tag).join(", ")}`,
    );
    console.log(`Bot user: ${client.user.tag} (ID: ${client.user.id})`);
    console.log(`Is bot mentioned: ${isBotMentioned(message, client.user)}`);
  }

  // Check if the bot is mentioned
  if (!isBotMentioned(message, client.user)) {
    return;
  }

  // Remove bot mentions from the message content
  const cleanContent = cleanMessageContent(message.content);

  // If there's no content after removing mentions, skip
  if (!cleanContent) {
    return;
  }

  console.log(`Processing message from ${message.author.tag}: ${cleanContent}`);

  try {
    // Reply immediately with a placeholder
    const firstResponse = await message.reply("Tao đang suy nghĩ...");

    // Call the /api/chat endpoint
    const text = await callChatAPI(cleanContent);

    // Final check if text is empty
    if (!text || text.length === 0) {
      console.warn("Empty response from chat API");
      await firstResponse.edit(
        "Sorry, I couldn't generate a response. Please try again.",
      );
      return;
    }

    // Split text into chunks that fit Discord's message limit
    const chunks = splitTextIntoChunks(text);
    const totalParts = chunks.length;

    // Send first chunk by editing the placeholder message
    const firstChunk = formatChunkWithIndicator(chunks[0]!, 1, totalParts);
    await firstResponse.edit(firstChunk);

    // Send remaining chunks as new messages
    if (chunks.length > 1 && message.channel.isTextBased()) {
      // Type assertion: channels that pass isTextBased() check should have send method
      // We'll catch any errors if the channel doesn't support sending
      const channel = message.channel as {
        send: (content: string) => Promise<Message>;
      };

      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i]!;
        const formattedChunk = formatChunkWithIndicator(
          chunk,
          i + 1,
          totalParts,
        );

        try {
          // Send as a follow-up message in the same channel
          await channel.send(formattedChunk);

          // Small delay to avoid rate limiting (except for last message)
          if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (sendError) {
          // If sending fails (e.g., permissions, channel type), log and continue
          console.warn(
            `Failed to send chunk ${i + 1}/${totalParts}:`,
            sendError,
          );
          // Try to append a note to the first message
          if (i === 1) {
            const note = `\n\n⚠️ [Response has ${totalParts} parts, but couldn't send remaining parts]`;
            const availableSpace =
              DISCORD_MESSAGE_LIMIT - firstChunk.length - note.length;
            if (availableSpace > 0) {
              await firstResponse.edit(firstChunk + note);
            }
          }
          break;
        }
      }
    }

    console.log(`Sent ${totalParts} message(s) for response`);
  } catch (error) {
    console.error("Error generating response:", error);
    try {
      await message.reply(
        "Sorry, I encountered an error while generating a response.",
      );
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
  }
}
