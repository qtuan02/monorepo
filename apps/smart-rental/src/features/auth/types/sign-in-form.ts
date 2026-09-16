// Namespace import, not `import { z }`: a bundler that externalizes zod for SSR
// on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.object` throws at module load — a failure that
// never reproduces on the Windows dev box. See `~/env.ts` for the same fix.
import * as z from "zod";

/**
 * One schema, two jobs: runtime validation through `zodResolver`, and the form's
 * value type through `z.infer`. Messages are the prototype's literal Vietnamese —
 * `FieldError` renders whatever string it is handed. The password is never
 * trimmed: a leading or trailing space is a legitimate character in one.
 */
export const signInFormSchema = z.object({
  email: z.email({ error: "Email không hợp lệ" }),
  password: z
    .string({ error: "Mật khẩu phải có ít nhất 6 ký tự" })
    .min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
