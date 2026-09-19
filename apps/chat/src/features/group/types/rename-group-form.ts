import * as z from "zod";

export const renameGroupFormSchema = z.object({
  name: z
    .string({ error: "Group name is required." })
    .trim()
    .min(1, { error: "Group name is required." })
    .max(120, { error: "Group name is too long." }),
});

export type RenameGroupFormValues = z.infer<typeof renameGroupFormSchema>;
