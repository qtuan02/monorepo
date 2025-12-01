import { getApiBaseUrl } from "./config";

/**
 * Represents different types of SSE data formats from AI SDK
 */
interface SSEData {
  type?: string;
  delta?: string;
  text?: string;
  parts?: { type: string; text?: string; delta?: string }[];
  content?: string | (string | { type: string; text?: string })[];
}

/**
 * Extracts text content from SSE data object
 * 
 * @param data - The parsed SSE data object
 * @returns The extracted text content, or empty string if no text found
 */
function extractTextFromSSEData(data: SSEData): string {
  let text = "";

  // Handle text-delta events (incremental text chunks)
  if (data.type === "text-delta" && data.delta) {
    text += data.delta;
  }
  // Handle complete text parts (fallback)
  else if (data.type === "text" && data.text) {
    text += data.text;
  }
  // Handle parts array format (UIMessage format)
  else if (data.parts && Array.isArray(data.parts)) {
    for (const part of data.parts) {
      if (part.type === "text" && part.text) {
        text += part.text;
      } else if (part.type === "text-delta" && part.delta) {
        text += part.delta;
      }
    }
  }
  // Handle legacy content format
  else if (data.content) {
    if (typeof data.content === "string") {
      text += data.content;
    } else if (Array.isArray(data.content)) {
      for (const item of data.content) {
        if (typeof item === "string") {
          text += item;
        } else if (item?.type === "text" && item.text) {
          text += item.text;
        }
      }
    }
  }

  return text;
}

/**
 * Processes a single SSE data line and extracts text content
 * 
 * @param line - The SSE data line (format: "data: {...}")
 * @returns The extracted text content from the line
 */
function processSSELine(line: string): string {
  if (!line.trim() || !line.startsWith("data: ")) {
    return "";
  }

  const jsonStr = line.slice(6); // Remove "data: " prefix

  // Skip [DONE] marker (stream end indicator)
  if (jsonStr.trim() === "[DONE]") {
    return "";
  }

  try {
    const data = JSON.parse(jsonStr) as SSEData;
    return extractTextFromSSEData(data);
  } catch (error) {
    // Skip invalid JSON lines
    console.warn("Failed to parse SSE line:", line, error);
    return "";
  }
}

/**
 * Parses Server-Sent Events (SSE) stream response from AI SDK
 * 
 * @param reader - The ReadableStreamDefaultReader to read from
 * @returns A promise that resolves to the complete text content from the stream
 */
async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<string> {
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      buffer += decoder.decode(value, { stream: true });
    }

    // Process complete lines from buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      fullText += processSSELine(line);
    }

    // If stream is done, process remaining buffer and exit
    if (done) {
      if (buffer.trim()) {
        fullText += processSSELine(buffer);
      }
      break;
    }
  }

  return fullText.trim();
}

/**
 * Calls the /api/chat endpoint and collects the streaming response
 * 
 * @param userMessage - The user's message to send to the chat API
 * @returns A promise that resolves to the complete response text from the AI
 * @throws Error if the API call fails or response is invalid
 */
export async function callChatAPI(userMessage: string): Promise<string> {
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

    const reader = response.body.getReader();
    return await parseSSEStream(reader);
  } catch (error) {
    console.error("Error calling chat API:", error);
    throw error;
  }
}

