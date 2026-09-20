---
"@fe-monorepo/ui": patch
---

`Button` now stamps `data-variant={variant}` on its root element, matching the
same convention already carried by `Item`, `Field`, `Tabs`, `ToggleGroup` and
other primitives in this package. Additive only — no visual or behavioral
change.
