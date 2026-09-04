---
title: Format Dates Through the `@monorepo/dayjs` Singleton
impact: HIGH
impactDescription: One configured dayjs — plugins extended once, formats in one table, no second date library
tags: dates, dayjs, timezone, locale, formats
---

## Format Dates Through the `@monorepo/dayjs` Singleton

**Impact: HIGH (One configured dayjs — plugins extended once, formats in one table, no second date library)**

Every date is parsed, formatted and compared through **`@monorepo/dayjs`** — the workspace's one
pre-configured dayjs. Import the default export; never import `dayjs` from the raw package. The raw
package has no plugins extended, so `.tz()` / `.utc()` / `.from()` throw or silently misbehave on it.
The singleton extends its plugins at **module scope**, so ESM guarantees it is configured once before
any importer — there is no `createDayjs()` to remember to call (contrast `@monorepo/i18n`, which
genuinely needs a wiring site because it takes app config).

`date-fns` appears in `packages/ui/package.json` **only** because `react-day-picker` depends on it.
It is not exported by `@monorepo/ui` and is not reachable from an app — never reach for it.

| Import | Holds |
|---|---|
| `@monorepo/dayjs` | the configured singleton (default export) |
| `@monorepo/dayjs/formats` | `DATE_FORMAT`, `TIME_FORMAT`, `TIME_WITH_SECONDS_FORMAT`, `DATE_TIME_FORMAT`, `FULL_DATE_FORMAT`, `FULL_DATE_TIME_FORMAT` |
| `@monorepo/dayjs/set-locale` | `setDayjsLocale(locale: string)` |
| `@monorepo/dayjs/locales` | the locale registry — `locales`, `DayjsLocale`, `defaultLocale` |

**Incorrect (raw dayjs, inline format strings, hand-rolled parsing):**

```tsx
// ❌ the raw package — no plugins extended, so .tz() throws at runtime
import dayjs from "dayjs";

// ❌ an inline format string — drifts from the shared table, and day-first vs
//    month-first is exactly the bug nobody notices until the 13th
<span>{dayjs(admittedAt).format("DD/MM/YYYY HH:mm")}</span>;

// ❌ extending a plugin from a component — the singleton owns plugin wiring
dayjs.extend(utc);
```

**Correct (the singleton + a format constant):**

```tsx
import dayjs from "@monorepo/dayjs";
import { DATE_TIME_FORMAT } from "@monorepo/dayjs/formats";

<span>{dayjs(admittedAt).format(DATE_TIME_FORMAT)}</span>;
```

## Timezone — the device's clock, pinned only when asked

The singleton sets **no** `tz.setDefault()`. A timestamp renders on the **device's** own clock, so a
user abroad reads the same instant on their own watch, and the package stays reusable by any app
rather than baking in one facility's zone. Where a screen must show a fixed zone no matter where it is
read, pass it explicitly:

```tsx
// ✅ explicit — this row must read in the facility's clock wherever it is opened
dayjs.utc(recordedAt).tz("Asia/Ho_Chi_Minh").format(DATE_TIME_FORMAT);
```

Never re-add `dayjs.tz.setDefault(...)` to the singleton to get that — it would silently re-anchor
**every** bare `.tz()` in every app. Note also that `dayjs.tz.guess()` returns whatever IANA name the
host resolves `+07` to (often `Asia/Bangkok`, not `Asia/Ho_Chi_Minh`) — equivalent in offset, so
never compare zone **names** to decide anything.

## Locale — go through `setDayjsLocale`, not `dayjs.locale`

`dayjs.locale("de")` for a locale that was never imported is a **silent no-op**: it leaves the
previous locale in place and nothing warns. `setDayjsLocale` checks the registry and falls back to
`defaultLocale` deliberately, and matches on the language half so a region code (`navigator.language`
gives `"en-US"`) still lands on `en`.

```ts
// ❌ silently keeps the previous locale when "de" was never imported
dayjs.locale(someLanguage);

// ✅ registry-checked, with a deliberate fallback
import { setDayjsLocale } from "@monorepo/dayjs/set-locale";
setDayjsLocale(someLanguage);
```

Adding a language is two edits **in the package**: append the code to `src/locales.ts` and add the
matching `import "dayjs/locale/<code>"` side-effect to `src/dayjs.ts`. Nothing in `apps/` changes.

## Layering — the package does not know about i18n

`@monorepo/dayjs` deliberately does **not** import `@monorepo/i18n`; it keeps its own locale registry by
value. That holds it at the foundation layer (its `tsconfig` does not even pull `dom`, so it stays
usable outside a browser) and keeps the graph acyclic — see
[[architecture-circular-dependencies]]. The **app** is the only layer that knows both, so the bridge
lives at the app's wiring site, alongside `~/libs/i18n.ts` and `~/libs/http-client.ts`:

```ts
// ✅ apps/<app>/src/libs/dayjs.ts — the app bridges the two singletons
import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import i18n from "~/libs/i18n";

setDayjsLocale(i18n.language);
i18n.on("languageChanged", setDayjsLocale);
```

That bridge keeps the **global** locale correct — which is what non-React code formatting a date
relies on. It does **not** make a component re-render on a language switch: a component that renders a
locale-sensitive token must thread the language in itself (see [[dates-locale-render-input]]).

## Conventions

- Import the singleton from `@monorepo/dayjs`; every other entry is a subpath (`/formats`,
  `/set-locale`, `/locales`) — no barrel (see [[quality-avoid-barrel-imports]]).
- Display strings come from `@monorepo/dayjs/formats`. Need a new one? Add it there once it has a real
  caller, never inline it at a call site.
- Need a plugin the singleton lacks? `dayjs.extend(...)` it in `packages/dayjs/src/dayjs.ts` — never
  from an app or a component. `timezone` must extend after `utc`.
- The API exchanges ISO strings; dayjs parses and serializes those without a format token. Reserve the
  format constants for what a user sees.
- Import the app's `~/libs/dayjs` once from the app entry so the bridge installs.

Reference: [`packages/dayjs/src/dayjs.ts`](../../packages/dayjs/src/dayjs.ts), [Day.js — Plugins](https://day.js.org/docs/en/plugin/plugin), [Day.js — i18n](https://day.js.org/docs/en/i18n/i18n)
