---
title: The next-intl Flavor — the Locale Lives in the URL, the Catalogue Is Shared ICU
impact: HIGH
impactDescription: One `[locale]` segment, three wiring files, and one ICU catalogue both Runtimes read — a language switch stays on the page and adds no second source of translations
tags: next, i18n, next-intl, app-router, icu, routing
---

## The next-intl Flavor — the Locale Lives in the URL, the Catalogue Is Shared ICU

**Impact: HIGH (Applies to Next Runtime apps — `apps/_template_next` and clones. A Vite Runtime app uses the i18next Flavor and `~/libs/i18n.ts` instead; the two never coexist in one app.)**

A Next app's language is a **URL segment**, not a mutable singleton. Every page lives under
`app/[locale]/`, `proxy.ts` negotiates the segment, and the shared registry in
`@monorepo/i18n/languages` still decides what `[locale]` may be. Three app files wire it, one job each:

| File | Holds |
|---|---|
| `~/i18n/routing.ts` | `createI18nRouting({ cookieName })` — one object, handed to **both** the proxy and `createNavigation`. They must agree on the prefix, or a generated `<Link>` points at a path the proxy never rewrites. |
| `~/i18n/request.ts` | `createRequestConfig({ timeZone, resolveLocale })` — a single default re-export; the whole callback lives in `@monorepo/i18n`. |
| `~/i18n/navigation.ts` | the one `createNavigation(routing)` destructure: `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. |

`localePrefix` is `as-needed`: the default language (`vi`) sits at the bare path, every other one is
prefixed (`/en/dashboard`). No component writes that prefix: paths come from `~/constants/routes`
and the navigation helpers add it (see [[next-app-router-structure]]).

## An unknown locale 404s; an unknown *message* locale falls back

```tsx
// ✅ app/[locale]/layout.tsx — `/de/...` is a real 404, not a silent render in the default
//    language, which would let a wrong URL rank in search results.
const { locale } = await params;
if (!hasLocale(routing.locales, locale)) notFound();
```

The request config instead falls back onto the registry (`isLanguageCode(requested) ? requested :
defaultLanguage`), because it also serves callers that pass a locale explicitly. That 404 is reachable
in ordinary use: the matcher skips any path with a dot, so `/foo.bar` arrives with `foo.bar` as segment.

## Switching language is navigation, never a mutation

**Incorrect (the i18next reflex, ported):**

```tsx
// ❌ `changeLanguage` is the i18next Flavor's switch — a Next app has no singleton to mutate, so
//    this changes nothing and leaves the locale in the URL untouched.
changeLanguage(value);
// ❌ `next/navigation`'s usePathname returns the path WITH the locale prefix, so replacing it
//    yields `/en/en/dashboard`. next-intl's returns it without one — that is the whole point.
import { usePathname, useRouter } from "next/navigation";
```

**Correct (replace the same page under the other locale):**

```tsx
// ✅ ~/components/select/select-language.tsx — the visitor stays exactly where they were
const locale = useLocale() as LanguageCode;
const pathname = usePathname(); // from ~/i18n/navigation
const router = useRouter();
<Select value={locale} onValueChange={(v) => router.replace(pathname, { locale: v as LanguageCode })}>
```

It is a Client Component reading URL data, so under `cacheComponents` it renders only inside a
`<Suspense>` — the header gives it a trigger-sized `Skeleton` fallback (see [[next-server-vs-client-components]]).

## The provider is handed `messages` and `timeZone` explicitly

`app/[locale]/layout.tsx` does `await Promise.all([getMessages(), getTimeZone()])` and passes both to
`I18nProvider`. next-intl fills them in itself only when `NextIntlClientProvider` is rendered
**directly** by a Server Component (the RSC build swaps in a server variant that awaits them); the
shared provider is `"use client"`, so nothing is inherited and passing them keeps the layout static.

## One catalogue, ICU, two Runtimes

A Locale message is **ICU MessageFormat** in `packages/i18n/src/locales/<code>.json`, and one object
serves both Flavors: next-intl reads ICU natively, the i18next Flavor mounts `i18next-icu`. So the
syntax is ICU throughout — `{name}`, never `{{name}}`, and one `{count, plural, …}` message instead of
a suffixed `key_one` / `key_other` pair. A leftover `{{name}}` renders literally instead of throwing.

```jsonc
// ✅ locales/vi.json — nested keys, read flat with dots: t("header.notificationSummary", { name, count })
"notificationSummary": "{name}: {count, plural, other {# thông báo mới}}"
```

## Conventions

- Add a language in `packages/i18n/src/languages.ts` + its `locales/<code>.json`; nothing under
  `apps/` changes — the typed `messages` map fails to compile until the JSON exists.
- Import by subpath (`@monorepo/i18n/languages`, `.../next-intl/create-routing`) — no root entry
  exists (see [[quality-avoid-barrel-imports]]).
- `Link` / `redirect` / `usePathname` / `useRouter` / `getPathname` come from `~/i18n/navigation`,
  never `next/link` or `next/navigation` — in components, Server Actions and the proxy alike.
- `timeZone` is pinned in `~/i18n/request.ts`, never guessed per request, or one timestamp renders
  differently on a laptop and in Docker. Read the locale from `next/root-params`, never next-intl's
  deprecated `requestLocale` — it reads a header and opts the render out of `cacheComponents`.
- The language cookie name is the app's own (`~/constants/cookies`), passed into `createI18nRouting`
  so two apps on one domain do not fight over one value (see [[next-proxy-guards]]).

Reference: [`apps/_template_next/src/i18n/request.ts`](../../apps/_template_next/src/i18n/request.ts), [`apps/_template_next/src/components/select/select-language.tsx`](../../apps/_template_next/src/components/select/select-language.tsx), [`packages/i18n/src/next-intl/create-routing.ts`](../../packages/i18n/src/next-intl/create-routing.ts), [ADR-0002](../../docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md), [next-intl — App Router setup](https://next-intl.dev/docs/getting-started/app-router), [next-intl — Messages](https://next-intl.dev/docs/usage/messages)
