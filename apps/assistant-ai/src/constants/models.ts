/**
 * The Gemini models this app offers, and the only place their ids are written.
 *
 * It sits in `~/constants` rather than inside the chat slice because both the
 * global model store (`~/stores/use-model-store.ts`) and the chat slice read it,
 * and a store may not import from a feature — that would point the graph upward
 * (see `.agents/rules/architecture-circular-dependencies.md`).
 */

export type GeminiModel =
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-3-pro-preview";

export interface GeminiModelInfo {
  id: GeminiModel;
  name: string;
  /**
   * The `assistantAi.models.*` key holding this model's one-line description.
   *
   * It is the id with each `.` written as `-`, and it is carried as a field
   * rather than derived from `id` at the call site because next-intl reads `.`
   * as its nesting separator: a key containing one is rejected outright at
   * catalogue load — for every Next app in the workspace, since they all mount
   * the same shared catalogue — and `t("gemini-2.5-flash")` would look for
   * `gemini-2` → `5-flash` rather than the message that is actually there.
   */
  descriptionKey: string;
  /** Free-tier quotas, shown under each option so a rate limit is not a surprise. */
  rpm: string;
  tpm: string;
  rpd: string;
}

/**
 * `gemini-3-pro-preview`, not the `gemini-3.0-pro-preview` the app this replaced
 * listed: that id does not exist on Google's API, so picking it produced a 404
 * on the first turn. It is the one id whose spelling changed in this migration.
 */
export const GEMINI_MODELS: readonly GeminiModelInfo[] = [
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    descriptionKey: "gemini-2-5-flash-lite",
    rpm: "10",
    tpm: "250K",
    rpd: "20",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    descriptionKey: "gemini-2-5-flash",
    rpm: "15",
    tpm: "250K",
    rpd: "1.000",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    descriptionKey: "gemini-2-5-pro",
    rpm: "20",
    tpm: "500K",
    rpd: "2.000",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    descriptionKey: "gemini-2-0-flash",
    rpm: "15",
    tpm: "1M",
    rpd: "1.500",
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    descriptionKey: "gemini-3-pro-preview",
    rpm: "5",
    tpm: "250K",
    rpd: "100",
  },
] as const;

/** What a first visit uses, and what an unknown id from a request body falls back to. */
export const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-2.5-flash";

/**
 * Narrows an untrusted string — a persisted store value, a request body field —
 * to a model this app actually offers. The route handler cannot trust the id it
 * is sent: the body is written by the browser.
 */
export function isGeminiModel(value: unknown): value is GeminiModel {
  return GEMINI_MODELS.some((model) => model.id === value);
}
