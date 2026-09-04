---
title: Give List Keys a Stable, Named Value — Never a Bare Index
impact: MEDIUM
impactDescription: Stable keys prevent wrong-row state, lost input, and mis-matched nodes on reorder/insert/delete
tags: quality, react, lists, keys
---

## Give List Keys a Stable, Named Value — Never a Bare Index

**Impact: MEDIUM (Stable keys keep each row's state, input, and focus tied to the item, not the position)**

Every `key` on a mapped element must be a **stable, identifying value**, not the bare array index. React
uses the key to match an element to its previous instance across renders. A bare `index` breaks that
match the moment the list reorders or changes length: React reuses the wrong DOM node, so a row's local
state, text input, or focus sticks to the *position* instead of the *item*. It also lets keys collide
across sibling lists on the same screen.

Two rules, in order of preference:

1. **Best — key by the item's own identifier** when it has one: `item.id`, `item.patientId`, etc. This
   is the drift-proof key.
2. **Fallback — a named prefix + the index** (`` `patient-row-${index}` ``) only when the item genuinely
   has no stable id (a static, never-reordered config row). The prefix documents the list and keeps keys
   unique. **Never** the bare `index`.

**Incorrect (bare index — breaks on reorder/insert/delete, collides across lists):**

```tsx
// ❌ key is the position, not the item — delete row 0 and every key shifts up by one,
//    so React keeps the old row-0 node for the new row-0 and its input/state is wrong
{patients.map((item, index) => (
  <PatientCard key={index} item={item} />
))}
```

**Correct (key by the item's identifier):**

```tsx
// ✅ each card is tied to its record — reorder/insert/delete keeps state on the right row
{patients.map((item) => (
  <PatientCard key={item.id} item={item} />
))}
```

**Acceptable fallback (no stable id — named prefix + index):**

```tsx
// ✅ a fixed, never-reordered list with no id: the prefix names the list and stays unique
{staticRows.map((row, index) => (
  <SettingRow key={`support-link-${index}`} row={row} />
))}
```

## Conventions

- Prefer the item's own field: `key={item.id}`; coerce non-string ids with `String()`
  (`key={String(item.patientId)}`).
- No id and the list never reorders → `` key={`<list-name>-${index}`} ``; never a bare `index` / `idx` /
  `rowIndex`.
- A composite key that is still position-based (`` key={`row-${index}`} ``) is not a fix when the item
  *has* an id — use the id.
- For large or virtualized lists, render rows with `@monorepo/ui/components/table` +
  `@tanstack/react-table`; the same rule applies to its `getRowId` — return `String(row.id)`, not the
  index.

Reference: [React — Rendering Lists: keeping list items in order with `key`](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
