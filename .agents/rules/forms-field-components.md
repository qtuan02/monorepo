---
title: Compose Form Fields with the Field Primitives
impact: HIGH
impactDescription: One accessible field anatomy — label, control, error — bound to react-hook-form with a Controller.
tags: forms, components, field, ui, accessibility, react-hook-form
---

## Compose Form Fields with the Field Primitives

**Impact: HIGH (One field anatomy — label + control + error — from a shared primitive family, wired to RHF)**

Build every field's layout from `@monorepo/ui/components/field`: `Field` (the row/group), `FieldLabel`, `FieldDescription`, `FieldError` (renders its message when present), `FieldContent` (the control column for horizontal rows), plus `FieldGroup`, `FieldSet`, and `FieldLegend` for grouping. Bind each field to the form with a `Controller` from `react-hook-form` and pair it with a labeled `@monorepo/ui/components/input`. Never hand-roll a `<label>`/error `<span>` per feature — the shared anatomy keeps the `role="group"` / `role="alert"` a11y wiring and the `data-slot` styling consistent.

There is **no** `Form`/`FormField`/`FormControl`/`FormMessage` wrapper family (the classic shadcn `form.tsx`) in this repo — compose `Controller` with the `Field` primitives directly. `Controller`'s `render` gives you `field` (spread onto the `Input`) and `fieldState` (`invalid`, `error`): wire `data-invalid` on `Field`, `aria-invalid` on the control, and pass the error to `FieldError` via its `errors` array. Validation itself comes from the Zod schema through `zodResolver` (see [[forms-schema-driven]]).

| Primitive | What it is | Role |
|-----------|-----------|------|
| `Field` | `role="group"` div, cva `orientation` (`vertical`/`horizontal`/`responsive`) | one field's row (label + control + error) |
| `FieldLabel` | wraps `Label` | the label; `htmlFor` → the input `id` |
| `FieldContent` | flex-column div | the control column in a `horizontal` row (switch/checkbox) |
| `FieldDescription` | muted `<p>` | optional hint under the control |
| `FieldError` | `role="alert"` div | renders `children` or an `errors` array; nothing when empty |
| `FieldGroup` / `FieldSet`+`FieldLegend` | stacking div / `<fieldset>`+`<legend>` | group related fields |
| `FieldTitle` | `<div>` with the label's type scale | a heading inside `FieldContent` where no control owns it |
| `FieldSeparator` | `<div>` with an optional centred label | a divider between groups of fields |

**Incorrect (hand-rolled markup + local state instead of a `Controller`):**

```tsx
// ❌ re-implements Field/FieldLabel/FieldError, loses the shared role="group"/role="alert"
//    wiring, and duplicates form state that react-hook-form already owns
<div>
  <label htmlFor="email">Email</label>
  <Input id="email" value={values.email} onChange={onChange} />
  {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
</div>;

// ❌ bare Label inside a field row — use FieldLabel so the row shares data-slots
import { Label } from "@monorepo/ui/components/label";
```

**Correct (a `Controller` composed with the field primitives):**

```tsx
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Controller } from "react-hook-form";
// `form` comes from useForm(...) — see [[forms-schema-driven]]

<FieldGroup>
  <Controller
    name="email"
    control={form.control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
        <Input
          {...field}
          id={field.name}
          type="email"
          aria-invalid={fieldState.invalid}
        />
        {/* FieldError takes an ARRAY of errors — it dedups and no-ops when empty */}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )}
  />
</FieldGroup>;
```

Switch/checkbox/radio rows use `orientation="horizontal"` with `FieldContent` holding the label + description beside the control:

```tsx
import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Controller } from "react-hook-form";

<Controller
  name="acceptTerms"
  control={form.control}
  render={({ field }) => (
    <Field orientation="horizontal">
      <Checkbox
        id={field.name}
        checked={field.value}
        onCheckedChange={field.onChange}
      />
      <FieldContent>
        <FieldLabel htmlFor={field.name}>Đồng ý điều khoản</FieldLabel>
        <FieldDescription>Bạn cần đồng ý để tiếp tục.</FieldDescription>
      </FieldContent>
    </Field>
  )}
/>;
```

## Actions sit outside the `<form>`, wired back by `id`

Give the `<form>` an `id` and point the submit button at it with `form="<id>"`. That keeps the actions
in a `CardFooter` (or any bar outside the form element) while still submitting it, and it is the shape
shadcn's own examples take. The action row is itself a `Field orientation="horizontal"`, so the buttons
inherit the same spacing as every other row:

```tsx
// ✅ apps/storybook/src/stories/form.stories.tsx
<CardContent>
  <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
    <FieldGroup>{/* … Controller rows … */}</FieldGroup>
  </form>
</CardContent>
<CardFooter>
  <Field orientation="horizontal">
    <Button type="button" variant="outline" onClick={() => form.reset()}>Huỷ</Button>
    <Button type="submit" form="profile-form">Lưu</Button>
  </Field>
</CardFooter>
```

A `<button>` with no `type` submits — always spell `type="button"` on a non-submitting action such as
Reset, or it silently submits the form it sits in.

**Conventions:**
- Import each primitive directly from `@monorepo/ui/components/field` (named exports) — never a barrel.
- One `Controller` + `Field` per input; `FieldLabel htmlFor` must match the control `id` (use `field.name`).
- Pass the error to `FieldError` via `errors={[fieldState.error]}` — it dedups by message and renders nothing when the entry is empty, so you never need a text `&&` guard inside it.
- Mark the invalid state with `data-invalid` on `Field` and `aria-invalid` on the control so the destructive styles apply.
- Switch/checkbox/radio rows: `orientation="horizontal"` + `FieldContent` for the label/description column. Group related fields with `FieldGroup`, or `FieldSet` + `FieldLegend` for a titled section. Style via `className`/`cn`, never inline `style`.
- Actions live outside the `<form>`, tied to it with `form="<id>"`; every non-submitting button spells `type="button"`.
- Read live values for conditional fields with [[forms-use-watch]].

The three worked examples live in [`apps/storybook/src/stories/form.stories.tsx`](../../apps/storybook/src/stories/form.stories.tsx) — a plain field pair, a textarea with a character counter, and a horizontal checkbox row. Copy the shape from there rather than from an older Radix-era snippet.

Reference: [shadcn/ui — React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form), [shadcn/ui — Field](https://ui.shadcn.com/docs/components/field), [React Hook Form — Controller](https://react-hook-form.com/docs/usecontroller/controller), [`../../packages/ui/src/components/field.tsx`](../../packages/ui/src/components/field.tsx)
