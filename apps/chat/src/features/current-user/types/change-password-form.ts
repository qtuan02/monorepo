import type { TFunction } from "i18next";
import * as z from "zod";

// 8–72 mirrors `chat-socket`'s `ChangePasswordRequest` validation.
export function createChangePasswordFormSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z
        .string({
          error: t(
            "chat.profile.changePassword.validation.currentPasswordRequired",
          ),
        })
        .min(1, {
          error: t(
            "chat.profile.changePassword.validation.currentPasswordRequired",
          ),
        }),
      newPassword: z
        .string({
          error: t(
            "chat.profile.changePassword.validation.newPasswordRequired",
          ),
        })
        .min(8, {
          error: t("chat.profile.changePassword.validation.newPasswordLength"),
        })
        .max(72, {
          error: t("chat.profile.changePassword.validation.newPasswordLength"),
        }),
      confirmPassword: z
        .string({
          error: t(
            "chat.profile.changePassword.validation.confirmPasswordRequired",
          ),
        })
        .min(1, {
          error: t(
            "chat.profile.changePassword.validation.confirmPasswordRequired",
          ),
        }),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      error: t(
        "chat.profile.changePassword.validation.confirmPasswordMismatch",
      ),
      path: ["confirmPassword"],
    });
}

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordFormSchema>
>;
