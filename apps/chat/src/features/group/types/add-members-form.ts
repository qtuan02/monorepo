import * as z from "zod";

export const addMembersFormSchema = z.object({
  memberIds: z
    .array(z.string())
    .min(1, { error: "Select at least one member to add." }),
});

export type AddMembersFormValues = z.infer<typeof addMembersFormSchema>;
