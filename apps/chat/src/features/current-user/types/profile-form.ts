import * as z from "zod";

// Field limits mirror `chat-socket`'s `UpdateUserRequest` validation.
export const profileFormSchema = z.object({
  username: z
    .string({ error: "Username is required." })
    .trim()
    .min(1, { error: "Username is required." })
    .max(50, { error: "Username is too long." }),
  email: z
    .email({ error: "Enter a valid email." })
    .max(255, { error: "Email is too long." }),
  firstName: z
    .string({ error: "First name is required." })
    .trim()
    .min(1, { error: "First name is required." })
    .max(70, { error: "First name is too long." }),
  lastName: z
    .string({ error: "Last name is required." })
    .trim()
    .min(1, { error: "Last name is required." })
    .max(30, { error: "Last name is too long." }),
  phone: z.string().trim().max(20, { error: "Phone number is too long." }),
  bio: z.string().trim(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
