import type { TFunction } from "i18next";
import * as z from "zod";

/**
 * A factory rather than a module-level schema: this app is bilingual, and a
 * Zod validator built once at import time would freeze its `error` strings
 * in whatever language was active on first load. The caller rebuilds it
 * from `useTranslation()`'s `t`, whose reference changes on a language
 * switch — see .agents/rules/forms-schema-driven.md, adapted here because
 * that rule assumes a single-language app.
 */
export function createSignInFormSchema(t: TFunction) {
  return z.object({
    username: z
      .string({ error: t("chat.auth.validation.usernameRequired") })
      .trim()
      .min(1, { error: t("chat.auth.validation.usernameRequired") }),
    password: z
      .string({ error: t("chat.auth.validation.passwordRequired") })
      .min(6, { error: t("chat.auth.validation.passwordMinLength") }),
  });
}

export type SignInFormValues = z.infer<
  ReturnType<typeof createSignInFormSchema>
>;
