import * as z from "zod";

// The source app's own copy, verbatim — this app ships no i18n (README).
export const signInFormSchema = z.object({
  username: z
    .string({ error: "Username is required." })
    .trim()
    .min(1, { error: "Username is required." }),
  password: z
    .string({ error: "Password is required." })
    .min(6, { error: "Password must be at least 6 characters." }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
