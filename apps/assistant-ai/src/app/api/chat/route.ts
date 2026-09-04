import type { UIMessage } from "ai";
import { getTranslations } from "next-intl/server";

import { defaultLanguage, isLanguageCode } from "@monorepo/i18n/languages";

import type { GeminiModel } from "~/constants/models";
import { DEFAULT_GEMINI_MODEL, isGeminiModel } from "~/constants/models";
import { streamChat } from "~/features/chat/server/stream-chat";

/**
 * The chat endpoint the browser's transport posts to. A thin route module like
 * every other one in this app: it validates the body, resolves the catalogue for
 * the visitor's locale, and hands both to the slice. The model call, the MCP
 * connection and the failure classification all live in `~/features/chat/`.
 *
 * It sits outside `[locale]`, and `proxy.ts`'s matcher already excludes `/api`,
 * so neither the session guard nor locale negotiation touches it — which is why
 * the locale arrives in the body instead.
 */

interface ChatRequestBody {
  messages?: UIMessage[];
  model?: unknown;
  locale?: unknown;
}

/** A turn may run well past the default serverless limit once a tool is called. */
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as ChatRequestBody;

  // Both fields are written by the browser, so neither is trusted: an unknown
  // model id would reach Google as a 404 and an unknown locale would throw
  // inside next-intl.
  const model: GeminiModel = isGeminiModel(body.model)
    ? body.model
    : DEFAULT_GEMINI_MODEL;
  const locale = isLanguageCode(body.locale) ? body.locale : defaultLanguage;

  const t = await getTranslations({ locale, namespace: "assistantAi.errors" });

  return streamChat({
    messages: body.messages ?? [],
    model,
    translateError: (code) => t(code),
  });
}
