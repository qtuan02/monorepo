---
title: React 19 — ref Is a Prop, Drop forwardRef
impact: HIGH
impactDescription: Smaller components; no compatibility wrapper; future-proof against React 19+.
tags: react, react-19, ref, forwardref, props
---

## React 19 — ref Is a Prop, Drop forwardRef

**Impact: HIGH (`forwardRef` is deprecated in React 19; new code must use ref-as-prop)**

In React 19, `ref` is a regular prop on function components — `React.forwardRef` is no longer needed and is on the deprecation path. Any component that needs to forward a ref declares it directly in its props type as `React.Ref<T>`. Do not add `forwardRef` to new code, and remove it whenever you touch a component that still has it. The primitives in `@monorepo/ui` already emit ref-as-prop form — match them.

**Incorrect (legacy `forwardRef` wrapper):**

```tsx
// ❌ forwardRef is deprecated in React 19 — extra wrapper, extra generic noise
import { forwardRef } from "react";

export const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  function FieldInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn("…", className)} {...props} />;
  },
);
```

**Correct (React 19 — `ref` as a regular prop):**

```tsx
// ✅ ref is a normal, optional prop typed as React.Ref<T>
type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function FieldInput({ className, ref, ...props }: FieldInputProps) {
  return <input ref={ref} className={cn("…", className)} {...props} />;
}
```

- Type the ref with `React.Ref<TElement>` on the props type — never destructure and reassign it manually.
- `ref` is optional; the component renders identically with or without it.
- For internal refs that are not forwarded, keep `React.useRef<T>(null)` — that is unchanged in React 19.
- `useImperativeHandle` still exists but is rarely needed; prefer exposing behaviour via plain functions or hooks.

Reference: [React 19 — `ref` as a Prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
