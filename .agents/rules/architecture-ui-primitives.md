---
title: Use and Extend UI Primitives in `@monorepo/ui`
impact: CRITICAL
impactDescription: One place to look for a primitive — no buttons/inputs/cards hand-rolled inside features
tags: architecture, components, ui, shadcn, base-ui, cva
---

## Use and Extend UI Primitives in `@monorepo/ui`

**Impact: CRITICAL (One place for every primitive — no duplicate buttons/inputs/cards re-built inside features)**

`@monorepo/ui/components/*` holds the workspace's **style-only UI primitives** — the shadcn `base-vega`
style (`Button`, `Input`, `Card`, `Dialog`, `Select`, `Table`, `Skeleton`, `Field`, … 63 of them), built
on **Base UI** (`@base-ui/react`) rather than Radix. That base is a settled decision, not a preference:
every convention below (`render` instead of `asChild`, bare state attributes, the two orientation
variants) falls out of it.
Before writing raw `<button>`/`<div>` markup in a feature, check this package for a primitive that
already does the job. Primitives sit below the feature layer so every slice can depend on them (see
[[architecture-circular-dependencies]]); this is the primitive half of
[[architecture-feature-boundaries]].

A primitive knows nothing about the app's domain: **no `~/hooks/api`, `~/stores`, or `~/features`
imports.** It takes props and renders styled elements — nothing else. A component that needs data
belongs in `~/components` instead (see [[architecture-shared-components]]).

## Finding and using primitives

Import each primitive directly from its own file — there is no barrel (see
[[quality-avoid-barrel-imports]]). `cn` (`twMerge(clsx(...))`) comes from `@monorepo/ui/utils/cn`:

```tsx
import { Button } from "@monorepo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";
```

## Composing with `render`, not `asChild`

Base UI drops Radix's `asChild`/`Slot` pattern. To render a primitive as a different element — a
`DialogTrigger` around a custom control, a `TooltipTrigger` around a `Button` — pass that element
to the primitive's **`render` prop** instead of wrapping it. The primitive merges its own props (event
handlers, `data-slot`, ARIA attributes) onto the element you hand it.

**Incorrect (the old Radix `asChild` shape — Base UI primitives have no `asChild` prop):**

```tsx
// ❌ asChild/Slot no longer exists on @monorepo/ui primitives — this prop is silently dropped
<DialogTrigger asChild>
  <Button variant="outline">Mở</Button>
</DialogTrigger>
```

**Correct (the target element is the `render` value):**

```tsx
// ✅ the trigger renders as the Button
<DialogTrigger render={<Button variant="outline">Mở</Button>} />
```

The same shape composes a close button inside a dialog, or a menu trigger around another primitive:

```tsx
// ✅ packages/ui/src/components/alert-dialog.tsx — AlertDialogCancel renders as Button
<AlertDialogPrimitive.Close
  render={<Button variant={variant} size={size} />}
  {...props}
/>
```

`render` also accepts a function `(props, state) => element` when the rendered element needs the
primitive's own state (open/checked/disabled, …) to decide what to render — see
[Base UI — Composition](https://base-ui.com/react/handbook/composition) for that shape.

## A link that looks like a button is a `Link` + `buttonVariants`, not a `Button`

`Button` is the one primitive `render` does **not** compose cleanly with a router `Link`. Base UI's
Button assumes it renders a native `<button>`; hand it an `<a>` and it logs a console error on every
render ("expected a native `<button>` because the `nativeButton` prop is true"). Its own escape hatch
makes it worse: `nativeButton={false}` silences the warning by stamping `role="button"` onto the
anchor, so a control that *navigates* stops announcing as a link.

So style the `Link` instead — `buttonVariants` is exported alongside `Button` for exactly this, and it
is the same `cva` the primitive itself uses, so the two are pixel-identical:

```tsx
// ❌ warns on every render; `nativeButton={false}` would "fix" it by overriding role="link"
<Button render={<Link to={ROUTES.HOME}>{t("comingSoon.backToHome")}</Link>} className="mt-4" />

// ✅ apps/_template_vite/src/components/exception/coming-soon.tsx — a real link, styled as a button
<Link to={ROUTES.HOME} className={cn(buttonVariants(), "mt-4")}>
  {t("comingSoon.backToHome")}
</Link>
```

Inside a tooltip the styled `Link` is what the trigger renders — `TooltipTrigger` passes its props
through without claiming button semantics:

```tsx
// ✅ apps/_template_vite/src/features/layout/components/header/header-auth-button.tsx
<TooltipTrigger
  render={
    <Link
      to={ROUTES.SIGN_IN}
      aria-label={label}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), iconButtonClassName)}
    >
      <LogIn className="size-4.5" />
    </Link>
  }
/>
```

`nativeButton={false}` stays correct where the rendered element genuinely **is** a button that is not
a `<button>` tag — a `<div>` role="button" that must contain block children. It is never the answer for
a link.

## Styling open/checked state: bare data-attributes, not `data-[state=...]`

Base UI exposes state as **bare** boolean data-attributes — `data-open`, `data-closed`, `data-checked`,
`data-starting-style`, `data-ending-style` — not Radix's bracketed `data-[state=open]="open"` value
attribute. Style them as plain Tailwind attribute selectors:

```tsx
// ❌ Radix's value-attribute shape — Base UI never sets a `state` attribute to match against
className="data-[state=open]:animate-in data-[state=closed]:animate-out"

// ✅ packages/ui/src/components/dialog.tsx — bare boolean attributes
className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
```

`data-[state=…]` is still correct where **the component itself sets the attribute** rather than reading
one from Base UI — `attachment` (`idle`/`uploading`/`done`/`error`), `sidebar` (`collapsed`), and
`table` rows (`selected`, set by TanStack Table). The rule bans mirroring *Radix's* state attribute,
not writing your own.

**Orientation is the one exception, and it is not optional to get right.** Base UI states it as a
*value* attribute — `data-orientation="horizontal"` / `data-orientation="vertical"` — on every part of
`Slider`, `ScrollArea`, `Tabs`, `ToggleGroup` and `Separator`. It never sets a bare `data-horizontal`.
The shadcn registry nevertheless styles against `data-horizontal:` / `data-vertical:`, so
[`tooling/tailwind/globals.css`](../../tooling/tailwind/globals.css) declares the two `@custom-variant`s
that map them onto the real attribute:

```css
@custom-variant data-horizontal (&[data-orientation="horizontal"]);
@custom-variant data-vertical (&[data-orientation="vertical"]);
```

Keep those two lines. Deleting them compiles every `data-horizontal:`/`data-vertical:` utility in the
package — 50-odd of them, including `group-data-vertical/tabs:` — down to nothing, and a Tailwind
utility that matches no element produces **no CSS and no error**: the slider track loses its height, the
scrollbar its width, and a tabs list stretches to full height. A jsdom test cannot catch this, because
jsdom computes no layout — the seam is Storybook (see [[testing-coverage]]).

A portaled overlay (`Dialog`, `Sheet`, `Popover`, `Drawer`, `Tooltip`, …) carries Tailwind's `isolate`
class on its backdrop/positioner so its stacking context works the way Base UI expects — keep that
class if you touch one of these primitives; don't strip it while "cleaning up" the className string.

## Adding a new primitive

Add a primitive with the shadcn generator — **never hand-copy one into an app**:

```bash
bun run --filter @monorepo/ui ui-add
```

A primitive wraps its Base UI part, forwards `data-slot`, and merges classes with `cn` — `className`
merged **last** so callers can override. Variants come from `cva`, exposed via `VariantProps`, and
everything is a **named export** — follow the shape of `button.tsx`:

```tsx
// ✅ packages/ui/src/components/button.tsx — the reference shape
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center rounded-md ...", {
  variants: { variant: { default: "bg-primary ...", outline: "border ..." } },
  defaultVariants: { variant: "default" },
});

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**Incorrect (hand-rolled markup inside a feature instead of reusing/adding a primitive):**

```tsx
// ❌ src/features/patient/components/save-bar.tsx — re-implements Button with inline styles
function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <button onClick={onSave} style={{ padding: 12, background: "#2563eb", borderRadius: 6, color: "#fff" }}>
      Lưu
    </button>
  );
}
```

**Correct (compose the existing primitive):**

```tsx
// ✅ reuse Button from @monorepo/ui — no new markup, no inline colors
<Button onClick={onSave}>Lưu</Button>
```

## The theme reaches an outside consumer as a CSS entry of the shell

Inside the workspace the theme arrives through `@monorepo/tailwind-config/globals`, and no app does
anything else. A consumer who installed the published shell (`@fe-monorepo/ui`, see
[ADR-0004](../../docs/adr/0004-npm-publish-qua-publish-shell.md)) has no workspace to import from, so the
same CSS ships as an entry of the package — and it takes one line more than it looks, because Tailwind v4
does not scan `node_modules`:

```css
@import "tailwindcss";
@import "@fe-monorepo/ui/globals.css";
@source "../node_modules/@fe-monorepo/ui/dist";
```

Drop the `@source` and every utility written inside the primitives compiles to nothing — the same
silent failure the two `@custom-variant`s cause, one level further out: no CSS, no error, just unstyled
components. Those two variants ride along in the shipped stylesheet, which is why importing it is not
optional for a consumer either.

## Conventions

- One component → one file; import by concrete path, never a barrel (see
  [[quality-avoid-barrel-imports]]).
- Style with `cva` + `cn` and theme tokens from `@monorepo/tailwind-config`; never inline `style` for
  anything static.
- Compose a different rendered element via the **`render` prop** — never look for `asChild`, it does
  not exist on a Base UI-backed primitive. The exception is a navigation link: style a `Link` with
  `buttonVariants` rather than rendering it through `Button`.
- Style open/checked/disabled state with bare data-attributes (`data-open`, `data-checked`, …), never
  the bracketed `data-[state=...]` Radix shape. Orientation is the exception — it is a real value
  attribute (`data-orientation="…"`), reached through the two `@custom-variant`s in the Tailwind
  globals.
- Every primitive root forwards `data-slot="<name>"` — keep it when wrapping or extending one, other
  primitives and Tailwind's `in-data-[slot=...]`/`has-data-[slot=...]` selectors depend on it.
- Named exports only (`export { Button, buttonVariants }`) — no default export.
- No `~/hooks/api`, `~/stores`, or `~/features` imports — a data-driven component belongs in
  `~/components` (see [[architecture-shared-components]]).
- A primitive that needs a generic hook (media query, debounce, clipboard) imports it from
  `@monorepo/hook` — `sidebar.tsx` takes `useIsMobile` from `@monorepo/hook/use-is-mobile`. Never add a
  hooks folder inside this package; if the shadcn CLI scaffolds one, move it to `packages/hook` and
  re-point the import (see [[quality-imports]]).

Reference: [`packages/ui/src/components/button.tsx`](../../packages/ui/src/components/button.tsx), [Base UI — `render` prop](https://base-ui.com/react/handbook/composition)
