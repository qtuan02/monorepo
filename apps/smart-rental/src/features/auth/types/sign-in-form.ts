// Namespace import, not `import { z }`: a bundler that externalizes zod for SSR
// on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.object` throws at module load — a failure that
// never reproduces on the Windows dev box. See `~/env.ts` for the same fix.
import * as z from "zod";

/**
 * One schema, two jobs: runtime validation through `zodResolver`, and the form's
 * value type through `z.infer`. A hand-written mirror interface would drift from
 * the validators the first time either side changes.
 *
 * `.trim()` runs before `.min(1)` on purpose, so a whitespace-only entry fails
 * rather than passing a length check. The password is never trimmed — a leading
 * or trailing space is a legitimate character in one.
 *
 * Messages are literal Vietnamese rather than i18n keys: `FieldError` renders
 * whatever string it is handed, so a key would surface to the user verbatim.
 */
export const signInFormSchema = z.object({
  username: z
    .string({ error: "Vui lòng nhập tài khoản." })
    .trim()
    .min(1, { error: "Vui lòng nhập tài khoản." }),
  password: z
    .string({ error: "Vui lòng nhập mật khẩu." })
    .min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
