---
title: Schema-Driven Forms with Zod
impact: HIGH
impactDescription: One Zod schema is the single source of truth for a form's validation and its TypeScript type.
tags: zod, validation, forms, types, react-hook-form
---

## Schema-Driven Forms with Zod

**Impact: HIGH (One schema drives runtime validation and the inferred form-value type)**

Every form defines one Zod schema at `~/features/<feat>/types/<form>-form.ts`. That schema is the single source of truth for **both** runtime validation and the form-value type — derive the type with `type XxxFormValues = z.infer<typeof xxxFormSchema>`, never a hand-written mirror interface that silently drifts. Trim string input **before** length checks so whitespace-only values fail, and attach a user-facing `{ error }` message to every validator.

The schema drives a real `react-hook-form` form through `zodResolver` — `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod` (both installed). Always pass `defaultValues` (empty strings, never `undefined`) so every field is controlled from first render.

**Incorrect (hand-written type, no messages, no trim):**

```typescript
// ❌ hand-written value type drifts from the schema — infer it with z.infer instead
export interface SignInFormValues {
  username: string;
  password: string;
}

// ❌ no `{ error }` — users see Zod's default English strings
// ❌ no `.trim()` before `.min(1)` — a whitespace-only "   " passes validation
export const signInFormSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});
```

**Correct (one schema, inferred type, trimmed + messaged validators):**

```typescript
// Namespace import, not `import { z }` — see the note below.
import * as z from "zod";

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
```

Bind the schema to the form with `useForm` + `zodResolver`, then compose the fields with `Controller` (see [[forms-field-components]]):

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  signInFormSchema,
  type SignInFormValues,
} from "~/features/auth/types/sign-in-form";

const form = useForm<SignInFormValues>({
  resolver: zodResolver(signInFormSchema),
  defaultValues: { username: "", password: "" }, // always controlled — never undefined
});

// handleSubmit validates against the schema, then hands you typed values
const onSubmit = form.handleSubmit((values) => signInMutation.mutate(values));
```

## Import zod as a namespace

Every zod import in this workspace is `import * as z from "zod"` — `packages/env`, every app's
`~/env.ts`, and every form schema.

The named form is not a style variant, it is a latent runtime failure. `z` is a **namespace
re-export** (`export { z }`) rather than a real binding, and a bundler that externalizes zod for a
server build can drop it: `z` then resolves to `undefined` and `z.object` throws at module load.
That failure was observed on a musl/Linux SSR build while every local run stayed green, which is
exactly the shape of bug worth spending a convention on — the namespace import survives
externalization on every platform, so there is no case where the named one is better.

```typescript
// ❌ compiles and passes locally; `z.object is undefined` at module load once externalized
import { z } from "zod";

// ✅ the namespace import survives externalization
import * as z from "zod";
```

**Conventions:**
- Location `~/features/<feat>/types/<form>-form.ts`; schema `<xxx>FormSchema`, type `<Xxx>FormValues`, inferred with `z.infer` — never a `types/index.ts` barrel (see [[architecture-features-modules]]).
- Import zod as `import * as z from "zod"` — the named import can vanish when a server build externalizes the package.
- **Zod v4 syntax:** attach `{ error }` to every validator — `{ message }` is the deprecated Zod v3 spelling.
- Validation messages are literal strings, not i18n keys: `FieldError` renders whatever string it is handed, so a key would surface to the user verbatim.
- Non-empty strings: `.string({ error }).trim().min(1, { error })` — order matters, `.trim()` runs before the length check. Email: `z.email({ error })` (Zod 4 top-level, replaces the deprecated `.string().email()`). Passwords: `.min(6, { error })`, never trimmed.
- A checkbox that must be ticked is `z.literal(true, { error })` — not `z.boolean()`, which accepts `false` and lets an unticked box submit. Its `defaultValue` is still `false` so the control stays controlled from first render.
- Always pass `defaultValues` to `useForm` (empty strings, never `undefined`).
- Cross-field rules (confirm password, …) live in the schema via `.refine()`, not in the component.
- Compose the inputs with `Controller` + the field primitives — see [[forms-field-components]]; read live values for conditional fields with [[forms-use-watch]]; submit through a mutation hook — see [[tanstack-consume-mutation]].

Reference: [Zod 4](https://zod.dev/v4), [React Hook Form — Schema Validation](https://react-hook-form.com/get-started#SchemaValidation)
