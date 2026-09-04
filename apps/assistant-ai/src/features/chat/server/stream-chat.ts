import type { UIMessage } from "ai";
import { convertToModelMessages, stepCountIs, streamText } from "ai";

import type { GeminiModel } from "~/constants/models";
import type { ChatErrorCode } from "../utils/chat-error-code";
import { chatErrorCode } from "../utils/chat-error-code";
import { googleProvider } from "./chat-model";
import { loadMcpTools } from "./mcp-tools";

/**
 * How many model calls one turn may make. A tool call and its answer are two
 * steps, so the default of one would end the turn on the tool result and leave
 * the visitor looking at raw JSON — which is what the app this replaced did for
 * every tool except `get-weather`, the one it special-cased.
 */
const MAX_STEPS = 5;

/**
 * Sent only when tools are actually available, so a plain chat is not primed to
 * talk about tools it does not have. English on purpose: it addresses the model,
 * not the visitor, and it tells the model to answer in the visitor's language.
 */
const TOOL_SYSTEM_PROMPT =
  "You can call tools to look up information. After a tool returns, write a " +
  "short, friendly summary of the result as a separate message — never paste " +
  "the raw tool output. Answer in the same language the user wrote in.";

interface StreamChatOptions {
  messages: UIMessage[];
  model: GeminiModel;
  /** Renders a classified failure in the visitor's language. */
  translateError: (code: ChatErrorCode) => string;
}

/**
 * One chat turn, from the messages the browser sent to the UI message stream it
 * reads back.
 *
 * The MCP connection is opened before the model call and closed when the stream
 * ends — including when it ends by failing — because a tool's `execute` runs
 * long after this function has returned its `Response`.
 */
export async function streamChat({
  messages,
  model,
  translateError,
}: StreamChatOptions): Promise<Response> {
  const { tools, close } = await loadMcpTools();
  const hasTools = Object.keys(tools).length > 0;

  const result = streamText({
    model: googleProvider(model),
    // `await`: `convertToModelMessages` became async in AI SDK v6 — it may
    // have to download a file part before the model can be called.
    messages: await convertToModelMessages(messages),
    ...(hasTools
      ? { tools, stopWhen: stepCountIs(MAX_STEPS), system: TOOL_SYSTEM_PROMPT }
      : {}),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onEnd: () => {
      void close();
    },
    onError: (error) => {
      void close();
      return translateError(chatErrorCode(error));
    },
  });
}
