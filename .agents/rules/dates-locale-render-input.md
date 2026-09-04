---
title: Locale-Sensitive Dates Need the Language as a Render Input
impact: HIGH
impactDescription: The React Compiler memoizes on what it can see; dayjs's global locale is invisible, so a language switch leaves stale text on screen
tags: dates, dayjs, locale, react-compiler, i18n, memoization
---

## Locale-Sensitive Dates Need the Language as a Render Input

**Impact: HIGH (The React Compiler memoizes on what it can see; dayjs's global locale is invisible, so a language switch leaves stale text on screen)**

This app builds with **React Compiler** (`babel-plugin-react-compiler`, wired in each app's
`vite.config.ts`), which auto-memoizes render output against the inputs it can **see** — props, state,
and hook results. dayjs's active locale is none of those: it is **global mutable state inside the
dayjs module**, set imperatively by `setDayjsLocale` (see [[dates-dayjs-singleton]]). The compiler
cannot see it change, so a component that renders a locale-sensitive token keeps painting the **old
language** after a switch, even though it re-rendered.

Thread the language through `.locale()` so the output becomes a real function of its inputs. This is
dayjs's documented instance-locale API — it returns a new instance scoped to that locale, leaving the
global one alone.

**Incorrect (relies on the global locale — the compiler memoizes it away):**

```tsx
// ❌ useTranslation() re-renders this on a language switch, but its result is
//    discarded, so the compiler sees only `now` and reuses the cached JSX —
//    the weekday stays in the previous language until `now` happens to change
export default function HeaderClock() {
  const [now, setNow] = useState(() => Date.now());
  useTranslation();
  // …
  return <span>{dayjs(now).format(FULL_DATE_TIME_FORMAT)}</span>;
}
```

**Correct (the language is part of the render input):**

```tsx
// ✅ output is a function of (now, the resolved language) — the switch invalidates the memo
export default function HeaderClock() {
  const [now, setNow] = useState(() => Date.now());
  const { i18n } = useTranslation();
  // …
  const current = dayjs(now).locale(i18n.resolvedLanguage ?? defaultLanguage);
  return <span>{current.format(FULL_DATE_FORMAT)}</span>;
}
```

## `resolvedLanguage`, not `language`

`i18n.language` keeps the detected code **verbatim**: a browser reporting `vi-VN` gives you
`.locale("vi-VN")`, which dayjs never imported — and `dayjs.locale()` for an unknown locale is a
**silent no-op** that leaves the previous language on screen. That is the same failure this rule
exists to prevent, arriving through a different door.

`i18n.resolvedLanguage` is the registry entry actually in use (`vi`), which is exactly what
`@monorepo/dayjs` has loaded. It is typed `string | undefined`, so pair it with the registry's own
fallback rather than a literal:

```tsx
import { defaultLanguage } from "@monorepo/i18n/languages";

// ❌ "vi-VN" is not a locale dayjs imported — this no-ops and the weekday stays stale
dayjs(now).locale(i18n.language);

// ✅ the resolved registry code, with the registry's fallback
dayjs(now).locale(i18n.resolvedLanguage ?? defaultLanguage);
```

The same `resolvedLanguage` rule applies to anything else keyed by language code — the language
switcher reads it for the current `<SelectItem>` value for exactly this reason.

## Which formats this applies to

Only **locale-sensitive** output is affected. A purely numeric format renders identically in every
language, so it needs nothing:

| Needs `.locale(...)` | Safe as-is |
|---|---|
| `dddd`, `ddd` (weekday), `MMMM`, `MMM` (month name) | `DD/MM/YYYY`, `HH:mm`, `YYYY-MM-DD` |
| `A` / `a` (AM/PM), `LT`/`LL`-style localized formats | any all-numeric token string |
| `.fromNow()`, `.from()`, `.to()`, `.calendar()` | `.diff()`, `.isBefore()`, `.unix()` |

So `DATE_FORMAT` / `TIME_FORMAT` / `TIME_WITH_SECONDS_FORMAT` / `DATE_TIME_FORMAT` are safe, while
`FULL_DATE_FORMAT` and `FULL_DATE_TIME_FORMAT` (both lead with `dddd`) and every relative-time
readout are not.

## Why not "just fix the bridge"

The `~/libs/dayjs` bridge already keeps the global locale following i18next, and it is still the right
place for that — non-React code formatting a date depends on it. But no amount of bridge work makes a
memoized component recompute: the bridge mutates state React was never told about. The component is
where the dependency has to be declared.

This trap is silent in the worst way — it hides behind anything that **does** change. A clock ticking
once a second self-heals within a second, so the bug only shows on a **static** timestamp. To spot it,
switch the language and change nothing else: if the weekday stays in the old language until something
unrelated re-renders, the dependency is missing.

## Conventions

- Rendering `dddd` / `MMMM` / `.fromNow()` in a component? Take `i18n` from `useTranslation()` and pass
  `i18n.resolvedLanguage ?? defaultLanguage` to `.locale()` — every time, not only where a switcher is
  nearby.
- Build the dayjs instance **during render** from a timestamp in state, never store a dayjs instance in
  state: an instance freezes the locale it was constructed with, so it goes stale the same way.
- `.locale(...)` on an instance never mutates the global one — `setDayjsLocale` remains the only way to
  move the global default (see [[dates-dayjs-singleton]]).
- The same reasoning covers any global mutable singleton read during render. If React cannot see it
  change, it is not a dependency, and the compiler is free to cache straight through it.

Reference: [Day.js — Changing locales locally](https://day.js.org/docs/en/i18n/changing-locale), [React Compiler](https://react.dev/learn/react-compiler), [`apps/_template_vite/src/features/layout/components/header/header-clock.tsx`](../../apps/_template_vite/src/features/layout/components/header/header-clock.tsx)
