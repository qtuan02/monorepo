import type { Message } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";

import { env } from "../env";

let client: Client | null = null;
let isInitialized = false;

export function getDiscordClient(): Client | null {
  if (client?.isReady()) {
    return client;
  }
  return null;
}

/**
 * Get the base URL for API calls
 */
function getApiBaseUrl(): string {
  // In production, use the deployed URL or environment variable
  if (env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN) {
    return `${env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN}`;
  }
  // For local development, default to localhost:3000
  const port = env.PORT || "3000";
  return `http://localhost:${port}`;
}

/**
 * Call the /api/chat endpoint and collect the streaming response
 */
async function callChatAPI(userMessage: string): Promise<string> {
  const baseUrl = getApiBaseUrl();
  const apiUrl = `${baseUrl}/api/chat`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            id: `discord-${Date.now()}`,
            role: "user",
            parts: [
              {
                type: "text",
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // Parse the Server-Sent Events (SSE) streaming response from AI SDK
    // Wait for the complete stream before returning the full text
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    // Read the entire stream until done
    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      // Process complete lines from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // SSE format: "data: {...}"
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6); // Remove "data: " prefix

          // Skip [DONE] marker (stream end indicator)
          if (jsonStr.trim() === "[DONE]") {
            continue;
          }

          try {
            const data = JSON.parse(jsonStr);

            // AI SDK UI Message Stream format
            // Handle text-delta events (incremental text chunks)
            if (data.type === "text-delta" && data.delta) {
              fullText += data.delta;
            }
            // Handle complete text parts (fallback)
            else if (data.type === "text" && data.text) {
              fullText += data.text;
            }
            // Handle parts array format (UIMessage format)
            else if (data.parts && Array.isArray(data.parts)) {
              for (const part of data.parts) {
                if (part.type === "text" && part.text) {
                  fullText += part.text;
                } else if (part.type === "text-delta" && part.delta) {
                  fullText += part.delta;
                }
              }
            }
            // Handle legacy content format
            else if (data.content) {
              if (typeof data.content === "string") {
                fullText += data.content;
              } else if (Array.isArray(data.content)) {
                for (const item of data.content) {
                  if (typeof item === "string") {
                    fullText += item;
                  } else if (item?.type === "text" && item.text) {
                    fullText += item.text;
                  }
                }
              }
            }
          } catch (error) {
            // Skip invalid JSON lines
            console.warn("Failed to parse SSE line:", line, error);
          }
        }
      }

      // If stream is done, process remaining buffer and exit
      if (done) {
        // Process remaining buffer
        if (buffer.trim()) {
          if (buffer.startsWith("data: ")) {
            const jsonStr = buffer.slice(6);

            // Skip [DONE] marker (stream end indicator)
            if (jsonStr.trim() === "[DONE]") {
              break;
            }

            try {
              const data = JSON.parse(jsonStr);
              if (data.type === "text-delta" && data.delta) {
                fullText += data.delta;
              } else if (data.type === "text" && data.text) {
                fullText += data.text;
              } else if (data.content && typeof data.content === "string") {
                fullText += data.content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
        break;
      }
    }

    // Return the complete text after stream is finished
    return fullText.trim();
  } catch (error) {
    console.error("Error calling chat API:", error);
    throw error;
  }
}

export async function initializeDiscordBot(): Promise<Client | null> {
  if (isInitialized && client) {
    return client;
  }

  if (!env.DISCORD_TOKEN) {
    console.error("DISCORD_TOKEN is not set");
    return null;
  }

  isInitialized = true;

  const newClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Register event handlers BEFORE login
  newClient.on("ready", () => {
    console.log(`Discord bot logged in as ${newClient.user?.tag}!`);
    console.log(`Bot ID: ${newClient.user?.id}`);
  });

  newClient.on("messageCreate", (msg: Message) => {
    void (async () => {
      // Ignore messages from bots
      if (msg.author.bot) return;

      // Debug: Log all messages with mentions
      if (msg.mentions.users.size > 0) {
        console.log(
          `Message received with mentions: ${msg.mentions.users.map((u) => u.tag).join(", ")}`,
        );
        console.log(
          `Bot user: ${newClient.user?.tag} (ID: ${newClient.user?.id})`,
        );
        console.log(
          `Is bot mentioned: ${newClient.user ? msg.mentions.has(newClient.user) : false}`,
        );
      }

      // Check if the bot is mentioned
      if (!newClient.user || !msg.mentions.has(newClient.user)) return;

      // Remove bot mentions from the message content
      const cleanContent = msg.content.replace(/<@\d+>/g, "").trim();

      // If there's no content after removing mentions, skip
      if (!cleanContent) return;

      console.log(`Processing message from ${msg.author.tag}: ${cleanContent}`);

      try {
        // Reply immediately with a placeholder
        const response = await msg.reply("Generating response...");

        // Call the /api/chat endpoint
        const text = await callChatAPI(cleanContent);

        // Final check if text is empty
        if (!text || text.length === 0) {
          console.warn("Empty response from chat API");
          await response.edit(
            "Sorry, I couldn't generate a response. Please try again.",
          );
          return;
        }

        // Discord has a 2000 character limit for messages
        let finalText = text;
        if (text.length > 2000) {
          finalText = text.substring(0, 1997) + "...";
        }

        await response.edit(finalText);
      } catch (error) {
        console.error("Error generating response:", error);
        try {
          await msg.reply(
            "Sorry, I encountered an error while generating a response.",
          );
        } catch (replyError) {
          console.error("Error sending error message:", replyError);
        }
      }
    })();
  });

  newClient.on("error", (error) => {
    console.error("Discord client error:", error);
  });

  newClient.on("disconnect", () => {
    console.warn("Discord client disconnected");
  });

  try {
    await newClient.login(env.DISCORD_TOKEN);
    client = newClient;
    console.log("Discord bot initialization complete");
    return client;
  } catch (error) {
    console.error("Failed to login to Discord:", error);
    isInitialized = false;
    return null;
  }
}

// Auto-initialize when module is loaded
if (typeof window === "undefined") {
  // Only run on server-side
  void initializeDiscordBot();
}
