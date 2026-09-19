import * as z from "zod";

export const createGroupFormSchema = z.object({
  name: z
    .string({ error: "Group name is required." })
    .trim()
    .min(1, { error: "Group name is required." })
    .max(120, { error: "Group name is too long." }),
  memberIds: z
    .array(z.string())
    .min(1, { error: "Select at least one member to create a group." }),
});

export type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;
