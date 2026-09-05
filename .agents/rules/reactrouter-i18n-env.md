---
title: Language by Cookie per Request, One i18next Clone per Render, and the Third env Flavor
impact: HIGH
impactDescription: The language is negotiated per request instead of prefixed onto every path, and a shared i18next singleton mutated on a request path serves one visitor's page in another visitor's language.
tags: react-router, i18n, i18next, env, ssr, cookies, middleware
---

## Language by Cookie per Request, One i18next Clone per Render, and the Third env Flavor

**Impact: HIGH (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. A Next app puts the locale in a `[locale]` URL segment instead, see [[next-i18n-next-intl]]; a Vite SPA app has no server render at all and needs neither the clone nor a `server` env block.)**

This Runtime keeps the language in a **cookie, negotiated against `Accept-Language`** — never a URL
segment, which would force a prefix onto every route of every clone. The decision is made **once per
request**, in `root.tsx`'s `middleware`, and everything downstream reads that answer.

```tsx
// ❌ one Node process renders every visitor at once, so this write is a race with no lock:
//    whichever of two overlapping renders wrote last decides the language BOTH of them
//    paint. Invisible under hand-testing; in production it is a page correctly rendered in
//    someone else's language.
export async function loader({ context }: Route.LoaderArgs) {
  await i18n.changeLanguage(context.get(languageContext));
  return null;
}

// ✅ src/root.tsx — decide once, into the context `entry.server` also receives
export const middleware: Route.MiddlewareFunction[] = [
  ({ request, context }, next) => {
    context.set(languageContext, resolveLanguage(request, LANGUAGE_COOKIE_NAME));
    return next();
  },
];

// ✅ src/entry.server.tsx — `@react-router/serve` passes no `getLoadContext`, but the server
//    runtime creates one `RouterContextProvider` per request and threads that same object
//    through middleware, the loaders and into this fifth argument.
const requestI18n = createRequestI18n(loadContext.get(languageContext));
```

`createRequestI18n` is `i18next.cloneInstance({ lng: language, initAsync: false })` — it shares the
resource store and the ICU formatter, so a clone costs an object per request, not a re-read of the
catalogue. `<I18nextProvider>` wraps `<ServerRouter>` from the **outside**, so it covers `root.tsx`'s
`Layout` and `ErrorBoundary` too. No runtime assertion could catch the race, so
`test/entry.server.test.ts` reads the entry as **text** and fails on
`expect(source).not.toContain("changeLanguage")`.

## `meta` translates with `getFixedT`, not a hook

Root's `loader` returns `{ language: context.get(languageContext) }` — the only way `meta`, which
runs outside the React tree, can reach the negotiated value at all.

```tsx
// ❌ no provider is in scope out there, so the request's clone is unreachable and the hook
//    call is illegal.
export function meta() { const { t } = useTranslation(); /* … */ }

// ✅ src/routes/home.tsx — reads the shared store at a fixed language without moving the
//    singleton, off root's loader data so it cannot disagree with the render.
const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);
```

Because `meta` sees only that frozen `loaderData`, root's `App` subscribes to
`i18n.on("languageChanged", revalidate)`; without it the body turns English while the title stays
Vietnamese until the next navigation. The detector writes the new cookie synchronously inside
`changeLanguage`, so the revalidation's own request already carries it — switching is a **state
change, not a navigation**.

## The client hydrates in the language the server sent

```tsx
// ❌ the server negotiated from cookie → Accept-Language, the browser detector from
//    document.cookie → navigator.language; every disagreement is a hydration mismatch that
//    makes React throw the server's markup away, and switching after hydrating is a flash.
const language = navigator.language.split("-")[0];
hydrateRoot(document, <HydratedRouter />);
void i18n.changeLanguage(language);

// ✅ src/entry.client.tsx — read what the server actually rendered, resolve the switch
//    BEFORE hydrating, and hydrate on BOTH settlements: a page hydrated in the wrong
//    language is a mismatch React recovers from, a page that never hydrates is not.
const serverLanguage = document.documentElement.lang;
const language = isLanguageCode(serverLanguage) ? serverLanguage : defaultLanguage;

void i18n.changeLanguage(language).then(hydrate, (error: unknown) => {
  console.error(error);
  hydrate();
});
```

`<html lang>` in `Layout` reads `i18n.resolvedLanguage` — never `loaderData` (`Layout` also wraps
`ErrorBoundary`, where no loader ran, and a switch does not re-run one), and never `.language`, which
the detector keeps as `vi-VN`. The **prerendered** `/about` is the one exception: rendered at build
time in the registry default, so `entry.client` also reads the stored choice with
`readLanguageCookie(document.cookie, …)` — before the switch above rewrites that cookie — and
`RestoreStoredLanguage` re-applies it in an effect, strictly **after** hydration has committed.

## The env Flavor is `react-router`, and it has a `server` block

The `vite` Flavor knows only a single `PUBLIC_` schema and has nowhere to put a secret; this Runtime
builds server and client code out of one Vite build, so it gets its own Flavor (ADR-0003).

```ts
// ❌ env-core decides server-vs-client access by the PREFIX, so a prefixed key filed under
//    `server` stays readable on the client and its value reaches the browser bundle from
//    this app's own `runtimeEnv`. The secret is present, not merely reachable.
server: { PUBLIC_ANALYTICS_ID: z.string().min(1) },

// ❌ safe in the browser — Vite replaces `SSR` with `false` there — but under a plain
//    Bun/Node run there is no Vite to replace it at all, so the `prebuild` and Dockerfile
//    env checks drop the `process.env` branch and always report the key missing.
TEMPLATE_REACTROUTER_SESSION_SECRET: import.meta.env.SSR
  ? process.env.TEMPLATE_REACTROUTER_SESSION_SECRET
  : undefined,

// ✅ apps/_template_reactrouter/src/env.ts — one module evaluated in BOTH graphs, so every
//    read here has to survive both. `typeof process` guards a bare `process.env.X`, which
//    would throw `ReferenceError` in the browser bundle, where Vite defines no `process`.
export const env = createEnv({
  server: { TEMPLATE_REACTROUTER_SESSION_SECRET: z.string().min(1) },
  client: {},
  runtimeEnv: {
    PUBLIC_APP_ENV: import.meta.env.PUBLIC_APP_ENV,
    // … the other two PUBLIC_* keys, each a literal `import.meta.env` read
    TEMPLATE_REACTROUTER_SESSION_SECRET:
      typeof process === "undefined"
        ? undefined
        : process.env.TEMPLATE_REACTROUTER_SESSION_SECRET,
  },
});
```

`runtimeEnv` must be the **full** map: env-core reads only that object and never falls back to
`process.env` per key the way the Next Flavor's `experimental__runtimeEnv` does (see
[[next-env-t3]]). `emptyStringAsUndefined` is on, so a blank line in `.env` is a missing value. The
base client block re-declares the three `PUBLIC_*` keys rather than importing the `vite` Flavor's — a
Flavor never imports another Flavor — and `packages/env/test/react-router/create-env.test.ts` holds
the two key sets equal. `react-router build` does not evaluate `src/env.ts` (ADR-0006), which is why
`package.json` carries a `prebuild` importing it under the root `.env` — a missing secret fails
there, by name, before `build` runs.

## Conventions

- The language is a cookie (`LANGUAGE_COOKIE_NAME` in `~/constants/cookies`, named per app) plus
  `Accept-Language` — never a route segment, and never a second `resolveLanguage` call outside root's
  `middleware`.
- `languageContext` is created **with** a default (`RouterContextProvider.get()` throws for a context
  never set and created without one) and lives in `~/libs`, because `entry.server` imports it and an
  entry importing a route module points the graph upward (see [[architecture-circular-dependencies]],
  [[reactrouter-route-modules]]).
- Never call `changeLanguage` on a server path; clone with `createRequestI18n` instead. In a
  component use `useTranslation()`; in `meta` use `i18n.getFixedT(...)`.
- Catalogue is shared ICU under `templateReactRouter.*` in `packages/i18n/src/locales/*.json` —
  `{name}` not `{{name}}`, one `{count, plural, …}` message, no rich-text tag; import by subpath (see
  [[quality-avoid-barrel-imports]]).
- `~/libs/dayjs`'s bridge is per **process** on the server, so no server-rendered component may lean
  on dayjs's global locale — thread the request's language into `.locale()` (see
  [[dates-locale-render-input]], [[dates-dayjs-singleton]]).
- The seam that proves the negotiation is E2E: fetch the document with Playwright's `request` fixture
  and an explicit `Accept-Language`, then assert `/<html[^>]*\slang="en"/` — only a raw fetch shows
  what the server sent (see [[testing-playwright]], [[reactrouter-server-modules]]).

Reference: [`apps/_template_reactrouter/src/root.tsx`](../../apps/_template_reactrouter/src/root.tsx), [`entry.server.tsx`](../../apps/_template_reactrouter/src/entry.server.tsx), [`entry.client.tsx`](../../apps/_template_reactrouter/src/entry.client.tsx), [`libs/language-context.ts`](../../apps/_template_reactrouter/src/libs/language-context.ts), [`src/env.ts`](../../apps/_template_reactrouter/src/env.ts), [`packages/i18n/src/resolve-language.ts`](../../packages/i18n/src/resolve-language.ts), [`packages/env/src/react-router/create-env.ts`](../../packages/env/src/react-router/create-env.ts), [ADR-0003](../../docs/adr/0003-env-two-flavors-native-prefix.md), [ADR-0006](../../docs/adr/0006-env-flavor-react-router-self-contained.md), [React Router — Middleware](https://reactrouter.com/how-to/middleware), [i18next — `cloneInstance`](https://www.i18next.com/overview/api#cloneinstance)
