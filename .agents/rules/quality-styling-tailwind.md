---
title: Style with Tailwind className, Not Inline style
impact: HIGH
impactDescription: One class-based system with theme tokens and merge semantics — consistent, themeable, less drift
tags: quality, styling, tailwind, cn, cva
---

## Style with Tailwind `className`, Not Inline `style`

**Impact: HIGH (One class-based system with theme tokens — consistent, themeable, no scattered magic numbers)**

Style with **Tailwind utilities via `className`**, compose them with `cn()` from
[`@monorepo/ui/utils/cn`](../../packages/ui/src/utils/cn.ts), and build reusable component variants with
`cva` (see [`button.tsx`](../../packages/ui/src/components/button.tsx)). A `className` carries theme
tokens (`bg-primary`, `text-foreground`), merges predictably (`tailwind-merge` dedupes conflicts), and
keeps sizing/spacing consistent instead of magic numbers sprinkled across `style` objects.

The tokens (`primary`, `foreground`, `muted-foreground`, `destructive`, `border`, …) come from
`@monorepo/tailwind-config` (`tooling/tailwind/theme.css`). Use the token classes so light/`dark` themes
flow through — never a raw hex, and never an arbitrary-value px hack (`w-[137px]`) where a scale utility
fits.

## How it should work

```tsx
// ✅ utilities via className; compose conditionals with cn(); plain div/span, not View/Text
import { cn } from "@monorepo/ui/utils/cn";

function Row({ active }: { active: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md p-3", active && "bg-primary/10")}>
      <span className="text-sm text-foreground">Nội dung</span>
    </div>
  );
}
```

```tsx
// ✅ reusable component variants → cva (as in button.tsx), not a pile of props
const cardVariants = cva("rounded-lg border border-border p-4", {
  variants: { tone: { default: "bg-background", warn: "bg-destructive/10" } },
  defaultVariants: { tone: "default" },
});
```

## When inline `style` is still allowed

Reserve `style` for values that are genuinely **runtime-dynamic** and have no utility — a measured height
from a `ResizeObserver`, a drag offset, a progress width from data:

```tsx
// ✅ dynamic runtime value — no equivalent utility exists
<div className="overflow-hidden rounded-md bg-card" style={{ height: measuredHeight }} />
<div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
```

Everything static (layout, spacing, colour, radius, typography) goes in `className`.

## Common Mistakes to Avoid

```tsx
// ❌ static layout as a style object — should be utilities
<div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12 }} />

// ❌ hard-coded hex instead of a theme token — breaks light/dark
<span style={{ color: "#EF4444", fontSize: 14 }}>Lỗi</span>

// ❌ branching whole style objects — cn() + conditional classes merges correctly
<div style={active ? activeStyle : baseStyle} />
```

```tsx
// ✅ utilities + token classes + cn() for the conditional
<div className={cn("flex items-center gap-2 p-3", active && "bg-primary/10")} />
<span className="text-sm text-destructive">Lỗi</span>
```

## Conventions

- Style with `className`; compose/merge with `cn()` from `@monorepo/ui/utils/cn` (wraps `clsx` +
  `tailwind-merge`).
- Reusable variants → `cva` (as in `@monorepo/ui/components/button`); expose a `className` prop and merge
  it **last** so callers can override.
- Use token classes (`bg-primary`, `text-foreground`, `border-border`), not raw hex or arbitrary px.
- `style` is the exception — reserve it for measured/dynamic values; never for static layout, spacing,
  or colour.
- The theme tokens are declared once in [`tooling/tailwind/theme.css`](../../tooling/tailwind/theme.css)
  and reach every app through `@monorepo/tailwind-config/globals`. Add a token there, never a per-app
  Tailwind config — there is none.

Reference: [Tailwind CSS](https://tailwindcss.com/docs), [`packages/ui/src/components/button.tsx`](../../packages/ui/src/components/button.tsx)
