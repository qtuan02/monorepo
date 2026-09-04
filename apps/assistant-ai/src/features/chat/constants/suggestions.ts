/**
 * The four starters shown on an empty thread, as catalogue keys under
 * `assistantAi.suggestions.*`. The prompt actually sent is the key's `title` and
 * `label` joined — the same sentence the visitor reads — so a translated
 * suggestion sends a translated prompt and the model answers in that language.
 */
export const CHAT_SUGGESTION_KEYS = [
  "tools",
  "hello",
  "weather",
  "forecast",
] as const;
