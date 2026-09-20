import type { TFunction } from "i18next";
import * as z from "zod";

// Field limits mirror `chat-socket`'s `UpdateUserRequest` validation.
// A factory, not a module-level schema — see sign-in-form.ts for why.
export function createProfileFormSchema(t: TFunction) {
  return z.object({
    username: z
      .string({ error: t("chat.profile.validation.usernameRequired") })
      .trim()
      .min(1, { error: t("chat.profile.validation.usernameRequired") })
      .max(50, { error: t("chat.profile.validation.usernameTooLong") }),
    email: z
      .email({ error: t("chat.profile.validation.emailInvalid") })
      .max(255, { error: t("chat.profile.validation.emailTooLong") }),
    firstName: z
      .string({ error: t("chat.profile.validation.firstNameRequired") })
      .trim()
      .min(1, { error: t("chat.profile.validation.firstNameRequired") })
      .max(70, { error: t("chat.profile.validation.firstNameTooLong") }),
    lastName: z
      .string({ error: t("chat.profile.validation.lastNameRequired") })
      .trim()
      .min(1, { error: t("chat.profile.validation.lastNameRequired") })
      .max(30, { error: t("chat.profile.validation.lastNameTooLong") }),
    phone: z
      .string()
      .trim()
      .max(20, { error: t("chat.profile.validation.phoneTooLong") }),
    bio: z.string().trim(),
  });
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof createProfileFormSchema>
>;
