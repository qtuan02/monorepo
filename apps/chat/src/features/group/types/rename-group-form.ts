import type { TFunction } from "i18next";
import * as z from "zod";

// Factory, not a module-level schema — this app is bilingual, see
// ~/features/auth/types/sign-in-form.ts for why.
export function createRenameGroupFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string({ error: t("chat.group.validation.nameRequired") })
      .trim()
      .min(1, { error: t("chat.group.validation.nameRequired") })
      .max(120, { error: t("chat.group.validation.nameTooLong") }),
  });
}

export type RenameGroupFormValues = z.infer<
  ReturnType<typeof createRenameGroupFormSchema>
>;
