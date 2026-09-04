/**
 * Classifies whatever failed during a chat turn into one of a closed set of
 * causes the UI has a message for.
 *
 * It returns a **code**, not a sentence: the message a visitor reads comes from
 * the shared catalogue (`assistantAi.chat.errors.*`), so it follows the locale
 * like every other string in the app. Returning text here would hard-code one
 * language into a route handler that sits outside `[locale]`.
 *
 * The AI SDK's own default is the literal `"An error occurred."` for every
 * failure, which is why a mistyped key and an exhausted quota were indistin-
 * guishable in the app this replaced. What is never returned is the provider's
 * raw message — it is rendered verbatim in the chat, and it can carry a URL, a
 * request id, or the key itself.
 *
 * Pure on purpose: this is the seam the failure path is tested at, with no
 * model, no network and no server.
 */

export const CHAT_ERROR_CODES = ["credential", "rateLimit", "generic"] as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

const CREDENTIAL_MARKERS = [
  "api key not valid",
  "api_key_invalid",
  "permission_denied",
  "unauthenticated",
  "invalid authentication",
  "api key expired",
];

const RATE_LIMIT_MARKERS = ["resource_exhausted", "rate limit", "quota", "429"];

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

export function chatErrorCode(error: unknown): ChatErrorCode {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const normalized = raw.toLowerCase();

  // Order matters: a quota rejection from Google mentions the API key too, and
  // "you are out of quota" is the half a visitor can act on.
  if (includesAny(normalized, RATE_LIMIT_MARKERS)) return "rateLimit";
  if (includesAny(normalized, CREDENTIAL_MARKERS)) return "credential";

  return "generic";
}
