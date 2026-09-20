# @fe-monorepo/ui

## 1.0.4

### Patch Changes

- e328335: `Button` now stamps `data-variant={variant}` on its root element, matching the
  same convention already carried by `Item`, `Field`, `Tabs`, `ToggleGroup` and
  other primitives in this package. Additive only — no visual or behavioral
  change.

## 1.0.3

> Version number chosen by hand rather than computed from the changesets below (`1.0.1`/`2.0.0` are burned on npm — see the package README). The changes themselves are exactly what the listed changesets describe.

### Major Changes

- Base UI, 63 primitives, an entirely new API.

  Rewritten from scratch — not an upgrade of `1.0.2`. 42 Radix-based primitives are replaced by 63
  shadcn `base-vega`-style primitives on Base UI, so `asChild` no longer exists (use `render`
  instead), state attributes are bare (`data-open`/`data-checked`) rather than
  `data-[state=…]`, and every prop follows Base UI's own shape. The package is ESM subpath-only
  (`@fe-monorepo/ui/components/button`), with no root entry and no CJS; peers are React >= 19 and
  Tailwind ^4. There is a new CSS entry, `@fe-monorepo/ui/globals.css`, carrying the theme tokens
  plus two `@custom-variant`s (`data-horizontal`/`data-vertical`) — without it, sliders, tabs and
  scroll areas lose their sizing. A Tailwind v4 consumer must add a `@source` line pointing at the
  package's `dist/`.

### Minor Changes

- `chart` re-exports the recharts marks a chart needs to place on its canvas — `Bar`, `BarChart`,
  `CartesianGrid`, `Cell`, `Pie`, `PieChart`, `XAxis`, `YAxis` — alongside the existing
  `ChartContainer` / `ChartTooltip` / `ChartLegend`. A consumer can now build a chart from the one
  `@fe-monorepo/ui/components/chart` entry without installing `recharts` separately. No existing
  API changed.

- `data-table` adds `useDataTable`, `DataTableContent`, and three types —
  `DataTableColumnDef` / `DataTableInstance` / `DataTableRowData`. `DataTable` remains the same
  batteries-included shape, now built on top of that same hook and table body. A composite that
  wants its own toolbar/pagination, or filter/page state kept in the URL, calls `useDataTable`
  with controlled `state` + `on…Change` and renders with `DataTableContent`, rather than
  re-implementing the v9 feature set. No existing API changed.

- `globals.css` now declares its own `@source "./"` — a consumer no longer has to write that line.
  Tailwind v4 never scans `node_modules`, and resolves `@source` relative to the stylesheet that
  carries it, so `dist/globals.css` registers the package's own `dist/` directory by itself. Setup
  is now two lines: `@import "tailwindcss"` then `@import "@fe-monorepo/ui/globals.css"`. The old
  `@source "../node_modules/@fe-monorepo/ui/dist"` line still works but is redundant — remove it.

### Patch Changes

- `dist/internal/` now carries only the two files `sidebar` actually uses (`use-is-mobile`,
  `use-media-query`) instead of the whole hook set, and the tarball ships `LICENSE-hooks-ts`:
  `use-media-query` is Derived from [hooks-ts](https://github.com/michal-worwag/hooks-ts) 0.12.0
  (MIT © 2024 Michał Worwąg). No API changed.
