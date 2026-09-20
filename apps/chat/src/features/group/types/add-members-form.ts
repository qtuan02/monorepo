import type { TFunction } from "i18next";
import * as z from "zod";

// Factory, not a module-level schema — this app is bilingual, see
// ~/features/auth/types/sign-in-form.ts for why.
export function createAddMembersFormSchema(t: TFunction) {
  return z.object({
    memberIds: z
      .array(z.string())
      .min(1, { error: t("chat.group.validation.selectMemberToAdd") }),
  });
}

export type AddMembersFormValues = z.infer<
  ReturnType<typeof createAddMembersFormSchema>
>;
