---
title: Subscribe to Field Values with `useWatch`, Not `watch`
impact: HIGH
impactDescription: Isolates re-renders to the one component that reads a field — a keystroke no longer re-renders the whole form
tags: forms, react-hook-form, performance, rendering
---

## Subscribe to Field Values with `useWatch`, Not `watch`

**Impact: HIGH (Isolates re-renders to the one component that reads a field — a keystroke no longer re-renders the whole form)**

To read a live field value inside a component, use the **`useWatch`** hook, never the form's
**`watch`** method. `form.watch("x")` (or `useFormContext().watch("x")`) subscribes the **entire
component** to the form: every keystroke in **any** field re-renders it, and everything it renders,
even parts that don't touch `x`. `useWatch({ control, name: "x" })` isolates the subscription to the
hook's own component, so only the small piece that displays `x` re-renders when `x` changes. This is
[[patterns-hooks-over-context]] applied to form state — subscribe narrowly, re-render narrowly.

When you split a form into nested field components, wrap it in `FormProvider` so each field pulls the
typed `control` from `useFormContext<T>()` and passes it to `useWatch` — that keeps the returned value
fully typed and is the same `control` a [[forms-field-components]] `Controller` binds to.

## How it should work

**Incorrect (`watch` re-renders the whole component on every field change):**

```tsx
// ❌ `watch("infusions")` subscribes THIS component to the form — typing in any unrelated
//    field re-renders InfusionSummary and its whole subtree
function InfusionSummary() {
  const { watch } = useFormContext<ExecuteFormValues>();
  const infusions = watch("infusions");
  return <div>{/* render infusion rows */}</div>;
}
```

**Correct (`useWatch` isolates the re-render to this component):**

```tsx
// ✅ only InfusionSummary re-renders, and only when `infusions` actually changes
function InfusionSummary() {
  const { control } = useFormContext<ExecuteFormValues>();
  const infusions = useWatch({ control, name: "infusions" });
  return <div>{/* render infusion rows */}</div>;
}
```

Watching several fields, or the whole form, takes the same shape:

```tsx
// ✅ an array of names — re-renders only when one of these changes
const [search, deptId] = useWatch({ control, name: ["filters.search", "departmentId"] });

// ✅ a value that may not exist yet on first render → provide defaultValue
const showAge = useWatch({ control, name: "showAge", defaultValue: false });
```

## Reading a value in a handler — use `getValues`, not `watch`

If you only need a field's value **at the moment a callback fires** (a submit, a button press), you
don't need a subscription at all — read it imperatively with `getValues`. `handleSubmit` already
hands you every value, so reach for `getValues` only outside it.

```tsx
// ❌ subscribing the component just to read a value inside a handler
const { watch } = useFormContext<ExecuteFormValues>();
const onSave = () => save(watch("infusions")); // re-renders on every keystroke for nothing

// ✅ read it imperatively — no subscription, no extra re-renders
const { getValues } = useFormContext<ExecuteFormValues>();
const onSave = () => save(getValues("infusions"));
```

## Common Mistakes to Avoid

1. **`const values = watch()` at the top of a form** — the worst case: subscribes the component to
   *every* field, so the whole form re-renders on every keystroke. Replace with a narrow
   `useWatch({ control, name })` in the small piece that needs the value.
2. **`watch("x")` to conditionally render a section** — move the `useWatch("x")` into the smallest
   component that owns that conditional, so the branch re-renders in isolation instead of the parent.
3. **`watch("x")` inside an event handler / submit** — use `getValues("x")` (or the `data` arg of
   `handleSubmit`); a subscription for a one-off read is pure overhead.
4. **Omitting `control`** — inside `FormProvider` `useWatch` works without it, but the return type
   degrades to `any`. Pass `control` from `useFormContext<FormValues>()` to keep it typed.

## Conventions

- Import `useWatch` from `react-hook-form`; get `control` from `useFormContext<FormValues>()` (the
  form type comes from the schema's `z.infer` — see [[forms-schema-driven]]).
- Subscribe with the **narrowest** `name` the component needs; give it a `defaultValue` when the field
  may be unset on first render.
- Reading, not subscribing? → `getValues` / the `handleSubmit` payload, never `watch`.
- Prefer moving a `useWatch` **down** into the smallest component that reacts to the value, the same
  way a self-fetching input owns its own data (see [[patterns-self-fetching-inputs]]).

Reference: [React Hook Form — `useWatch`](https://react-hook-form.com/docs/usewatch), [`useForm` — `watch`](https://react-hook-form.com/docs/useform/watch), [`getValues`](https://react-hook-form.com/docs/useform/getvalues)
