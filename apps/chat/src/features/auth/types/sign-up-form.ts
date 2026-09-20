import type { TFunction } from "i18next";
import * as z from "zod";

/** See `createSignInFormSchema` for why this is a factory over `t`, not a module-level schema. */
export function createSignUpFormSchema(t: TFunction) {
  return z.object({
    email: z.email({ error: t("chat.auth.validation.emailInvalid") }),
    firstName: z
      .string({ error: t("chat.auth.validation.firstNameRequired") })
      .trim()
      .min(1, { error: t("chat.auth.validation.firstNameRequired") }),
    lastName: z
      .string({ error: t("chat.auth.validation.lastNameRequired") })
      .trim()
      .min(1, { error: t("chat.auth.validation.lastNameRequired") }),
    username: z
      .string({ error: t("chat.auth.validation.usernameRequired") })
      .trim()
      .min(1, { error: t("chat.auth.validation.usernameRequired") }),
    password: z
      .string({ error: t("chat.auth.validation.passwordRequired") })
      .min(6, { error: t("chat.auth.validation.passwordMinLength") }),
  });
}

export type SignUpFormValues = z.infer<
  ReturnType<typeof createSignUpFormSchema>
>;
