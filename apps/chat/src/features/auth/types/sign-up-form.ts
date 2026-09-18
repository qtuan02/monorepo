import * as z from "zod";

// The source app's own copy, verbatim — this app ships no i18n (README).
export const signUpFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  firstName: z
    .string({ error: "First name is required." })
    .trim()
    .min(1, { error: "First name is required." }),
  lastName: z
    .string({ error: "Last name is required." })
    .trim()
    .min(1, { error: "Last name is required." }),
  username: z
    .string({ error: "Username is required." })
    .trim()
    .min(1, { error: "Username is required." }),
  password: z
    .string({ error: "Password is required." })
    .min(6, { error: "Password must be at least 6 characters." }),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
