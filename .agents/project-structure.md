# Project Structure — the full tree

> `CLAUDE.md` §1 is the short map; this is the long form: every folder of every app and package, and
> what each one deliberately does **not** have. An app's current visual shape lives in that app's own
> `README.md` (§ Hình dạng); the lines here summarise and point. When a design round ships, update the
> README first and this file second.
>
> Two terms decide almost everything below, defined in [`../CONTEXT.md`](../CONTEXT.md): a **Runtime**
> (Vite client SPA · Next.js App Router · React Router framework mode) and a **Flavor** (the
> Runtime-specific half of a shared package, on its own subpath).

## `apps/`

Every app states its two ports in its own `ports.env` (dev `3000 + n`, E2E `3100 + n`); `gen:app` assigns
the next free pair. All apps carry `README.md · test/ · e2e/ · Dockerfile · vitest.config.ts ·
playwright.config.ts · tsconfig.json · turbo.json`; the lines below list only what is specific.

### `_template_vite/` — Template app, **Vite Runtime** (dev 3000 / E2E 3100)

SPA behind nginx. Clone this for an app behind a login that no crawler needs.

```text
src/
├── assets/icons/      images the bundler owns (`vn.svg`, `gb.svg`), reached by import
├── components/        composites reused by more than one slice
│   ├── exception/     not-found · coming-soon · internal-server-error (the react-error-boundary fallback)
│   └── select/        select-language.tsx (header and sign-in both render it)
├── constants/         routes.ts (the ONE path table) · cookies.ts
├── features/<feat>/   `auth` · `home` · `layout` — each a complete vertical slice
│   ├── components/    feature UI (default export)
│   ├── provider/      route wrappers exposed to the route tree — `auth/provider/{protected,guest}-route.tsx`
│   ├── templates/     `<name>.template.tsx` (default export)
│   └── types/         Zod schemas and feature-local types
├── hooks/api/         TanStack Query hooks, one file per backend resource (`template.ts`)
├── libs/              wiring sites: `http-client.ts` (service singletons) · `i18n.ts` (i18next Flavor) ·
│                      `dayjs.ts` (i18n↔dayjs bridge) · `query-client.ts` (module singleton) · `query-key-factory.ts`
├── pages/             `main.tsx` (route tree + providers — the only page with logic) + thin `<feat>-page.tsx`
├── stores/            Zustand — `use-auth-store.ts` (the token, persisted)
├── env.ts             `createEnv(baseEnvSchema, import.meta.env)` from the **`vite` Flavor** of `@monorepo/env`
└── index.tsx · globals.css · vite-env.d.ts
e2e/support/auth-session.ts   `signIn(page)` seeds the persisted token before the app boots
Dockerfile              Bun builder (validates env by importing `src/env.ts`) → `nginx:stable-alpine`
vite.config.ts          `envDir: "../../"` + `envPrefix: "PUBLIC_"`, React Compiler via `@rolldown/plugin-babel`,
                        `server.port` + `preview.port` from `./ports.ts`, `strictPort`
ports.env · ports.ts    the two ports; `ports.ts` reads the file for `vite.config.ts` and `playwright.config.ts`
nginx.conf · index.html · public/favicon.png · vitest.setup.ts
```

### `_template_next/` — Template app, **Next Runtime** (dev 3001 / E2E 3101)

App Router, SSR/SEO, Node standalone.

```text
src/
├── app/[locale]/      the path table + framework wiring, nothing else (`next-app-router-structure`)
│   ├── layout.tsx     the root layout: owns `<html>`, validates the locale with `hasLocale`
│   ├── (shell)/       the app shell route group — `page.tsx` (public home) · `dashboard/` (guarded) ·
│   │                  `not-found.tsx` · `[...rest]/` (the catch-all that calls `notFound()`)
│   ├── sign-in/       outside `(shell)`: no shell chrome
│   └── error.tsx      the client-only error boundary
├── components/        `exception/` · `page/` (page-header, page-content) · `select/`
├── constants/         routes.ts (unprefixed paths handed to next-intl's `Link`) · cookies.ts (language + `HttpOnly` session)
├── features/<feat>/   `auth` · `dashboard` · `home` · `layout`
│   ├── actions/       Server Actions (`sign-in.ts`, `sign-out.ts`, `refresh-home-catalogue.ts`)
│   ├── guard/         the access decision as a PURE function (`session-guard.ts`, `safe-redirect-to.ts`) — exposed to `proxy.ts`
│   ├── server/        cached server reads (`home-catalogue.ts`: `"use cache"` + `cacheTag`/`cacheLife`)
│   └── components/ · templates/ · types/
├── hooks/api/         TanStack Query — only for what happens AFTER paint
├── i18n/              the three next-intl wiring files: `routing.ts` · `request.ts` · `navigation.ts`
├── libs/              `http-client.ts` (one service singleton for both data paths) · `query-client.ts`
│                      (`getQueryClient()` factory, never a module singleton) · `query-key-factory.ts`
├── proxy.ts           Next 16's `middleware.ts`, Node runtime: session guard first, then next-intl locale negotiation
├── env.ts             `createEnv({ server, client, clientRuntimeEnv })` from the **`next` Flavor** (t3-env)
├── instrumentation.ts · instrumentation-client.ts · sentry-runtime.config.ts
└── assets/ · globals.css · global.d.ts
next.config.ts          `cacheComponents` · `reactCompiler` · `output: "standalone"` · `transpilePackages` · next-intl plugin · `withSentry`
Dockerfile              Bun builder → `node:24-alpine` running `node server.js` as the `node` user
AGENTS.md · CLAUDE.md   written by `next dev` itself; do not hand-edit
ports.env · ports.ts    the same two files; `dev`/`start` hand `ports.env` to dotenv-cli (Next has no config-level port)
postcss.config.mjs
```

### `_template_reactrouter/` — Template app, **React Router Runtime** (dev 3005 / E2E 3105)

React Router 8 framework mode, SSR/SEO, served by `react-router-serve`.

```text
src/
├── routes.ts          the path table, **config-based** (`index()` / `layout()` / `route()`). `@react-router/fs-routes`
│                      is not installed: a module with no entry here does not exist. The nesting IS the access
│                      model — outer pathless `layout("routes/layout.tsx")` = the shell, inner pathless
│                      `layout("routes/protected.tsx")` = the session guard, the `*` splat beside the inner one
│                      (inside the shell, outside the guard). `sign-in` and `sign-out` sit outside the shell
├── routes/            thin route modules, one per entry: `layout` · `home` · `module` · `about` · `protected` ·
│                      `dashboard` · `not-found` · `sign-in` · `sign-out` (a **resource route**: `action` + `loader`,
│                      no default export, answers with a `Response` alone)
├── root.tsx           `Layout` owns `<html>` AND the providers (one `QueryClient` per render tree via
│                      `useState(getQueryClient)`); `App` is only the `<Outlet />`. The split keeps providers mounted
│                      when a route throws. Plus root `middleware` (negotiates the language once per request),
│                      `loader`, `links`, `ErrorBoundary`
├── entry.client.tsx   hydrates in the language `<html lang>` says the server rendered
├── entry.server.tsx   clones one i18next instance per request (`createRequestI18n`); never calls `changeLanguage`
├── components/        `exception/` (exception-state · internal-server-error · not-found) · `select/select-language.tsx`
├── constants/         **only** `cookies.ts` — no `routes.ts` (see below)
├── features/<feat>/   `about` · `auth` · `dashboard` · `home` · `layout`
│   ├── middleware/    the access decision exposed to `src/routes.ts` — `require-session.ts` · `guest-only.ts` ·
│   │                  `user-context.ts`. The counterpart of Vite's `provider/` and Next's `guard/`
│   └── components/ · constants/ · templates/ · types/ · utils/ (`safe-redirect-to.ts`, `request-path.ts`)
├── hooks/api/         TanStack Query — only for what happens AFTER paint
├── libs/              `http-client.ts` · `i18n.ts` · `dayjs.ts` · `query-client.ts` (`getQueryClient()` factory) ·
│                      `query-key-factory.ts` · `language-context.ts` (here so `entry.server` reads it without
│                      importing a route module) · **`session.server.ts`** — the `.server.ts` suffix is a build
│                      contract: the build refuses to bundle it into the client graph, and the name is all it checks
├── types/session-user.ts
├── env.ts             `createEnv({ server, client, runtimeEnv })` from the **`react-router` Flavor** (env-core) —
│                      evaluated in BOTH graphs: client keys are literal `import.meta.env` reads, the server key is
│                      guarded with `typeof process`
└── assets/icons/ · globals.css
react-router.config.ts  `ssr: true` · `appDirectory: "src"` (the default is `app`; this one word keeps `~/*`, the
                        `test/` mirror and the Biome `apps/**` overrides identical across Runtimes) ·
                        `prerender: ["/about"]` (a literal list, never `true`, which would also emit an `index.html`
                        for `/` that the static handler answers first) · `allowedActionOrigins`
Dockerfile              Bun builder (validates env by importing `src/env.ts`; asserts no `@monorepo/` specifier
                        survives into `build/server/index.js`) + a `node-bin` stage that copies a real `node` binary
                        (the prerender of `/about` needs react-dom's Node build, and `oven/bun`'s `node` is a Bun
                        shim that returns 500) → `node:24-alpine` running `@react-router/serve/bin.cjs`
vite.config.ts          `envDir: "../../"` + `envPrefix: "PUBLIC_"`, `resolve.tsconfigPaths`, React Compiler,
                        `server.port` from `./ports.ts`, and the one `process.env.VITEST` fork swapping
                        `reactRouter()` for `@vitejs/plugin-react`. No `preview` block — production is `react-router-serve`
ports.env · ports.ts    read from BOTH directions: `react-router dev` (a Vite server) takes `DEV_PORT` from
                        `ports.ts`; `react-router-serve` reads `PORT` and nothing else, so `start` hands the file to dotenv-cli
tsconfig.json           `rootDirs: [".", "./.react-router/types"]` — what makes `./+types/<route>` resolve
vitest.setup.ts · public/favicon.png
```

**Deliberately absent:** no `~/constants/routes.ts` (the path table is `src/routes.ts`; `react-router typegen`
turns it into the typed `href()`, so a second copy would drift); no `~/stores/` (the session is a signed
`HttpOnly` cookie from `~/libs/session.server.ts`); no `server/` or `actions/` inside a slice (a route module's
own `loader` / `action` is where server work lives).

### `documents/` — docs site for the two published packages (Vite, dev 3003 / E2E 3103)

`@monorepo/documents`, cloned from `_template_vite`. Written for an npm consumer: every example names
`@fe-monorepo/ui` / `@fe-monorepo/hook`, never the workspace name.

- **Shape "Prism"** (spec #128, ADR-0009, brief `docs/design/documents-redesign.md`; responsive round spec
  #215, `docs/design/documents-responsive.md`; glossary `apps/documents/CONTEXT.md`): no sidebar — a sticky
  glass nav pill, a `⌘K` `CommandDialog` and prev/next links are the whole navigation; glass panels over an
  aurora backdrop; list pages as a tile grid; an indigo palette overriding the whole shared palette at the app
  layer; Outfit + JetBrains Mono. Current details: `apps/documents/README.md` § Hình dạng.
- `scripts/generate-docs-metadata.ts` — the content. Parses `packages/ui/src/components/*.tsx` and
  `packages/hook/src/*.ts` with `oxc-parser` and writes `src/generated/{components,hooks}.json` (gitignored).
  Four pre-hooks regenerate it — `predev`, `prebuild`, `pretypecheck`, `pretest` — because Turbo's `typecheck`
  and `test` do not depend on the package's own `build`. The three tasks that read it declare
  `$TURBO_ROOT$/packages/{ui,hook}/src/**` in `inputs` (an out-of-package input must take that form).
- `src/features/` — `getting-started` · `component` · `hook` · `layout` (nav pill, search palette, backdrop,
  theme provider: a context + one `localStorage` key, no store). `~/components/` holds the Prism vocabulary (among others):
  `panel/glass-panel`, `tile/tile` (renders its own `<li>`), `swatch/swatch`, `detail/{toolbar,hero,panels}`,
  `page/{list-header,docs-section}`. `~/pages/` — `main.tsx` + six thin wrappers over `~/constants/routes.ts`
  (`/components/:slug`, `/hooks/:slug` + builders); an unknown slug 404s in place.
- `src/env.ts` — `baseEnvSchema.extend({ PUBLIC_DOCUMENTS_STORYBOOK_URL })`, **required**: every primitive
  page builds its demo link from it. Also exports `envSchema` so `test/env.test.ts` checks `.env.example`
  against this app's schema.
- `vercel.json` — deployed on Vercel; the Template Dockerfile stays for the CI `docker` job.
- **Deliberately absent:** no `auth` slice or route guard (public site); no TanStack Query and no
  `~/libs/http-client.ts` (no HTTP call at all); no app-wide store.

### `portfolio/` — the personal CV site (Next, dev 3002 / E2E 3102)

`@monorepo/portfolio`, cloned from `_template_next` because the page must be readable by a crawler before
any JS.

- **Shape "Terminal / neubrutalist"** (spec #113, ADR-0008, brief `docs/design/portfolio-redesign-v2.md`;
  responsive round spec #210, `docs/design/portfolio-responsive.md`): square corners, 2px edges, a hard
  offset shadow, mono headings over sans prose, an inverted dark theme, no scroll/load fade; the only app
  that overrides the shared neutrals. Current details: `apps/portfolio/README.md` § Hình dạng app.
- `src/features/` — two slices. `home` is the CV: eight sections in reading order (Hero → About → Work →
  Projects → Skills → Education → Contact + Hobbies) over `constants/resume.ts`, the order pinned by
  `test/features/home/templates/home.template.test.tsx`; every section after the hero renders on one
  `components/standard-block.tsx`; the hero is the page's one "terminal window" with `$ whoami` as the h1.
  `layout` is the dock navbar (four links, theme toggle, language switcher) and the slice's own
  `provider/theme-provider.tsx` (not `next-themes`).
- `src/app/` — `[locale]/(shell)/` with a one-line `page.tsx`; `[locale]/opengraph-image.tsx` generates
  the social card per locale (drawn by `features/home/components/open-graph-card.tsx`; `OPEN_GRAPH_PALETTE`
  spells the light theme's sRGB literally because Satori reads no custom property); `manifest.ts` ·
  `robots.ts` · `sitemap.ts` (the sitemap's `alternates.languages` is why `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN`
  is required).
- `src/globals.css` — the app's own palette (twelve colour tokens + `--radius: 0px`), written **unlayered**
  so it beats `theme.css`; a `prefers-reduced-motion` branch; `@media print` (this page IS the CV, "download"
  is the print dialog). `test/globals.test.ts` is the token contract — extend it, never loosen it. Full
  account: the README's palette section and ADR-0008.
- `src/proxy.ts` — same file, same named export, same literal matcher; the body is `negotiateLocale(request)`
  (no route is guarded, so the session branch is gone) behind one pass-through for `/vi/opengraph-image`
  (`as-needed` would 307 the default locale's card). The decision is `~/utils/metadata-image-path.ts`.
- `src/env.ts` — two app-owned keys: `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN`, `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN`.
- `vercel.json` — Vercel builds through `build:vercel` (`next build`, bare — no root `.env` there; values
  come from the dashboard).
- **Deliberately absent:** no TanStack Query, no `~/libs/http-client.ts`, no `~/stores/`, no `"use cache"`
  loader (the CV is a constant of its own slice, and it carries imported images and icons, which a cached
  payload cannot).

### `mcp/` — an MCP server over OpenWeatherMap (Next, dev 3004 / E2E 3104)

`@monorepo/mcp`, cloned from `_template_next`. The one app whose product is an endpoint: `POST /api/mcp`,
Streamable HTTP, three tools (`hello-world`, `get-weather`, `get-forecast`), no auth. The wire contract is
unchanged from the legacy app because a backend outside this repo calls it.

- `src/app/api/mcp/route.ts` — the whole HTTP surface: build a `WebStandardStreamableHTTPServerTransport`
  (takes a `Request`, returns a `Response`), connect a fresh server, hand over the request. Outside
  `[locale]`; `proxy.ts`'s matcher excludes `/api`, so neither the guard nor locale negotiation touches it.
- `src/features/weather/` — the one business slice. `server/mcp-server.ts` is a **factory** (a shared
  server would let a concurrent request swap another's transport). `server/openweathermap.ts` calls the
  provider directly rather than through `@monorepo/api` — a third-party API with one consumer and its own key
  (the exception in `architecture-features-modules.md`). `constants/tools.ts` is SDK-free data keyed by tool
  name. `types/weather.ts` declares the output shapes as zod schemas and infers the TS types.
  `utils/format-weather.ts` is the pure half. `test/features/weather/server/openweathermap.test.ts` runs on
  the **node** environment and stubs `fetch`.
- `src/env.ts` — `MCP_OPENWEATHERMAP_API_KEY` (server, **required**: a missing key fails `next build` by
  name) and `NEXT_PUBLIC_MCP_SENTRY_DSN`.
- **Keeps what `portfolio` dropped:** `[locale]`, next-intl, `proxy.ts` with the session guard, the `auth`
  slice and the guarded `dashboard`. The Template's `home` slice is replaced by an overview of the endpoint
  under the `mcp.*` message namespace.

### `smart-rental/` — the landlord's Portal (Vite, dev 3006 / E2E 3106)

`@monorepo/smart-rental`, cloned from `_template_vite`. Glossary: `apps/smart-rental/CONTEXT.md` (Portal,
Mock, Toà nhà, Building scope, Kỳ, Ngày thu, Chỉ số điện nước, Việc cần làm, …). Deployed on Vercel
(`vercel.json`); the Template Dockerfile stays for the CI `docker` job. No env key of its own.

- **Shape "Hôm nay"** — phase 1 ported the prototype `fe-motel-rsbuild` onto Mock (spec #127); phase 2
  redesigned it (spec #153, ADR-0011); round 3 "dễ hơn" collapsed chốt chỉ số → lập Đợt → Thu tiền into one
  screen `/cycles/:month` (spec #179, ADR-0013); spec #227 deepened four slices; round 4 "gọn hơn" cut sizes
  and counts per composite (spec #241, brief `docs/design/smart-rental-round4.md`; open follow-up #250).
  Current details: `apps/smart-rental/README.md` § Hình dạng round 4.
- `src/globals.css` — an unlayered `:root`/`.dark` override of the shared theme (ADR-0011): navy
  `--primary`, `--radius: 0.375rem`, IBM Plex Sans. Status colours stay the theme's own so a status never
  changes meaning between apps; four app-owned `--*-foreground-strong` tokens exist for badge text contrast.
  `test/globals.test.ts` (contrast + token parity) is the gate. `.dark` is fully written but never toggled.
- `src/constants/routes.ts` — the path table + builders, read from `~/pages/main.tsx`'s `AppRoutes` (split
  from `MainApp` so `test/pages/main.test.tsx` mounts it alone in a `createMemoryRouter` — that test is the
  spec's one seam: every route, with and without a Building scope, plus the guard cases).
- `src/components/` — the composites every slice stands on (among others): `data-table/` (`data-table.tsx` — search,
  faceted filters, sort, bulk selection, `renderMobileRow`, card/table toggle, URL-backed state via
  `use-table-search-params.ts`; `pagination-bar.tsx`) · `card/` (`kpi-strip`, `info-card` + `InfoRow`,
  `entity-list`, `stat-item`) · `badge/status-badge.tsx` · `page/` (`list-page-header`, `detail-page-shell` —
  entity header + tabs + right action column + `query`/`notFound`/`children(entity)`, `relation-tab`) ·
  `panel/` (`empty`, `error`, `loading` — footprint-shaped skeletons) · `form/` (`sheet`, `date-field`,
  `month-field`/`month-picker`, `currency-input-group`, a self-fetching `combobox`, `attachment`) ·
  `dialog/confirm-action-dialog` · `menu/entity-action-menu` · `queue/task-queue` · `navigation/page-back-button`.
- `src/constants/status.ts` — the ONE home for status/display config (`statusTone`, `StatusConfig`,
  per-entity configs, `toFilterOptions()`); `taskTypeConfig` is the one icon/label/route table the bell and
  Hôm nay's queue both read. Every slice appends here.
- `src/utils/` — pure derivation only (ADR-0012), each with a unit test (~30 files; list the folder before
  writing a new one). Examples: `date` (`formatDate`/`formatMonth`/`formatOptionalDate` — the Mock stores ISO
  only, screens convert at render), `currency`, `csv` (RFC 4180), `vietqr`, `contract-status`
  (`contractActions`, the one Gia hạn/Thanh lý/Xoá decision), `task-due`, `world` (`buildWorld`),
  `mock-reset` (`trackMockReset`).
- `src/features/` — `auth` (fake sign-in only; `provider/` guards as the Template) · `layout` (Building scope
  tabs under the header; sidebar in four groups; `< md` a 4-item bottom nav + a "Thêm" sheet) · `dashboard`
  (`/` = Hôm nay: three scoped KPIs + the Việc cần làm queue) · `cycles` (`/cycles/:month`, ADR-0013;
  `MeterCell` is the one gate shared by the table and its mobile card) · `buildings` · `rooms` · `tenants` ·
  `compliance` (the two Khai báo lưu trú obligations) · `contracts` (2-step wizard, Gia hạn, Thanh lý) ·
  `invoices` (Thanh toán, VietQR, Gửi nhắc, CSV/print) · `utilities` · `supplier-bills` · `expenses` ·
  `reconciliation` (derived, never its own Mock) · `reports` · `communications` · `settings` (hồ sơ + "Khôi
  phục dữ liệu mẫu").
- `src/stores/` — `use-auth-store.ts` (token + `user`) · `use-building-store.ts` (Building scope, persisted,
  `null` = every Toà nhà).
- `~/hooks/` — `use-delete-entity.ts` (the confirm-dialog → mutate → toast → `navigate(replace)` chain,
  written once for every detail screen that deletes) · `use-entity-form-sheet.ts` · `use-url-tab.ts`.
- `~/libs/http-client.ts` exports only `httpClient` (no service class until `be-motel` has a contract).
  `~/libs/mock-world.ts`'s `readWorld` (ADR-0015) is the one function outside a `mutationFn` allowed to touch
  `~/constants/mock`; every derived `queryFn` reads through it, and one `MutationCache.onSuccess` in
  `~/libs/query-client.ts` invalidates every query after any write. `test/hooks/api/world-write-seam.test.ts`
  scans every `~/hooks/api/*` file's text to hold both halves. The Mock lives in `~/constants/mock/<entity>.ts`,
  written to the `be-motel` contract shapes (ADR-0012), because `~/hooks/api` serves it and a hook may not
  import `~/features`.
- `test/text-tier-guard.test.ts` — text-scans `src/components/**` + `src/features/**/templates/**` for the
  banned `text-2xl`/`text-xl`/`font-bold`; the four size tiers are written as `text-[20px]`/`text-[15px]` for
  that reason.
- **Deliberately absent** (recorded in its README): no i18n (hardcoded Vietnamese, `setDayjsLocale("vi")`
  once in `src/index.tsx`, `@monorepo/i18n` off its deps); no dark-mode toggle; no `home` slice (`/` is Hôm
  nay); no sign-up/onboarding; no manual Task entry and no `/tasks` screen (Việc cần làm is derived and lives
  only in Hôm nay's queue and the bell); no `paymentDueDay`/`utilityCycleDay` (both collapsed onto
  `Building.collectionDay`).

### `chat/` — a Messenger-style app over `chat-socket` (Vite, dev 3007 / E2E 3107)

`@monorepo/chat`, cloned from `_template_vite`. Ported from `chat-socket-fe` (Rsbuild + STOMP) onto the
Spring Boot backend `chat-socket` (REST + STOMP on one port). Glossary: `apps/chat/CONTEXT.md`. Deployed on
Vercel.

- **Shape "Islands"** (spec #232, ADR-0016, brief `docs/design/chat-redesign.md`): every region — Rail,
  conversation list, message pane, Details, Bottom nav — sits on an `Island` (`bg-card/75`, 22px radius)
  floating on a static gradient painted at `body`. Teal `--primary` marks *what to do*, near-black
  `--foreground` marks *where you are*. `≥md` a `NavRail`, `<md` a 3-item `BottomNav`. Light/Dark/System
  toggle via context + one `localStorage` key (no store). Current details: `apps/chat/README.md` § Hình dạng
  Islands.
- Later specs: per-Island `react-error-boundary` fallbacks scoped to that Island's query keys (#251/#252;
  `~/components/exception/island-boundary.tsx`); the contract cutover onto `chat-socket`'s new shapes with
  Attachment, edit/delete message, typing indicator and change-password (#253); i18n via the i18next Flavor
  (cookie `chat_lang`, `chat.*` namespace) — Rail/Bottom nav/toggles translated, the rest still English.
- Env: `PUBLIC_CHAT_API_BASE_URL` (the `chat-socket` origin; the service appends `/api`) and
  `PUBLIC_CHAT_SOCKET_URL` (STOMP over WebSocket), via `baseEnvSchema.extend()`.
- Refresh-and-retry on 401/403 is `createHttpClient`'s opt-in `withCredentials`/`onAuthError` (ADR-0014),
  not a second HTTP layer.
- `src/globals.css` — the source's teal palette as an unlayered app-layer override (same shape as
  `portfolio`/`documents`/`smart-rental`), plus `--online` for the presence dot and the two
  `--islands-gradient-*` stops (inside `@layer base`, since `theme.css` sets no value for them).
- Timestamps: the backend returns UTC; `~/utils/date.ts` renders local (`toLocal`) and sends UTC ISO
  (`toApiTimestamp`).
- **Deliberately absent** (recorded in its README): no `home` slice; no `~/services/` (every call goes
  through a service class in `@monorepo/api`); no optimistic send / "Failed · Retry"; no message tombstone or
  image lightbox; no typing indicator in the conversation list; no server-side conversation search.

### `storybook/` — previews `@monorepo/ui` (port 6006)

`@monorepo/storybook`, Storybook 10.6 + `@storybook/react-vite`, `addon-docs` only. Its one port literal is
`-p 6006` in `package.json`; outside the `3000+n`/`3100+n` bands, no E2E, no `ports.env`. Its README is the
source of truth for story conventions (stage panel + `parameters.stage.width`, the self-written theme
toolbar, the Northwind fixtures) — read it before touching `.storybook/preview.tsx` or a story.

```text
.storybook/main.ts · preview.tsx
src/introduction.stories.tsx   `title: "Introduction"`, pinned first by `options.storySort`
src/support/                   Northwind fixtures — `people.ts` · `projects.ts` · `invoices.ts` · `notifications.ts`, no barrel
src/stories/                   one `*.stories.tsx` per primitive + one `use<Name>.stories.tsx` per hook
test/                          `stories.test.tsx` (renders every story via `composeStories`) · `story-conventions.test.tsx` ·
                               `preview-decorators.test.tsx` · `form-stories.test.tsx` · `date-picker-stories.test.tsx`
postcss.config.mjs · Dockerfile · nginx.conf
```

## `packages/` — ten workspaces

Eight source packages plus two **Publish shells**. Every source package is `private: true`, source-only,
with subpath-only `exports` into `src/` — apps import the `.ts`/`.tsx` directly, no build step between.
Six (`api`, `dayjs`, `env`, `i18n`, `sentry`, `types`) have no `build` task; `ui` and `hook` additionally
have one whose output lands in their shell (ADR-0004). Six carry their own Vitest runner (`api`, `dayjs`,
`env`, `ui` on node; `hook`, `i18n` on jsdom); `sentry` and `types` have no tests.

| Package | Holds | Exports |
|---|---|---|
| `api` | `createHttpClient` (axios) + `HttpError` + service classes under `src/<system>/<domain>-service.ts`; placeholder `template/template-service.ts` | `./*` |
| `types` | domain entities + per-endpoint params (`template.ts`) | `./*` |
| `hook` | 18 hooks: 17 **Derived** from [hooks-ts](https://github.com/michal-worwag/hooks-ts) 0.12.0 (MIT) + `use-is-mobile` (Own). Every Derived file opens with a `Derived from hooks-ts <File>.ts @ <SHA> …` header plus a `patched:` line; `derived-header.test.ts` reads every file as text so a missing header fails the Gate. `LICENSE-hooks-ts` ships in both shells. ADR-0010, **Derived** in `CONTEXT.md` | `./*` |
| `dayjs` | the configured singleton + `formats` + `locales` + `set-locale`. The ONE package with a root entry (`.` → `src/dayjs.ts`), because its root *is* the singleton | `.`, `./*` |
| `env` **Flavor** | shared `./http-url`. Vite: `./vite/{create-env,schema}` (`PUBLIC_`, `import.meta.env`). Next: `./next/{create-env,schema}` (t3-env, `NEXT_PUBLIC_`). React Router: `./react-router/{create-env,schema}` (env-core, `PUBLIC_` client block + a prefix-less `server` block that throws when read from the browser; re-declares its base keys rather than importing the Vite Flavor's). ADR-0003, ADR-0006, `packages/env/README.md` | per Flavor |
| `i18n` **Flavor** | shared: `./languages`, `src/locales/<code>.json` (ICU MessageFormat), `./change-language`, `./resolve-language` (cookie → `Accept-Language` → default). i18next: `./i18next/create-i18n` (ICU via `i18next-icu`), `./i18next/create-request-i18n` (one `cloneInstance` per SSR request). next-intl: `./next-intl/{create-routing,create-request-config,create-proxy,proxy-matcher,provider}`. ADR-0002 | per Flavor |
| `sentry` **Flavor** | a `@sentry/nextjs` wrapper, Next Flavor only (`client`, `server`, `edge`, `next-config`, `options`, `capture-request-error`). Only Next apps depend on it | `./*` |
| `ui` | 63 shadcn primitives, `base-vega` style, on Base UI. Internal Node subpath imports `#components/*`, `#utils/cn`, `#hooks/*`; `scripts/guard-no-local-hooks.ts` keeps `#hooks/*` an empty landing pad. Its own runner covers the framework-free utils; the primitives are covered by `apps/storybook`. `scripts/build.ts` fills `ui-public/dist`, inlining `use-is-mobile` + `use-media-query` into `dist/internal/` | `./components/*`, `./utils/*` |
| `ui-public` | **Publish shell** for `ui`, npm name `@fe-monorepo/ui`: a hand-written `package.json` (literal ranges — never `catalog:` or `workspace:`), a consumer README, a gitignored `dist/`. `dist/internal/` vendors the two hooks `sidebar` needs + `LICENSE-hooks-ts`, so it depends on no sibling | `./components/*`, `./utils/*`, `./globals.css` |
| `hook-public` | **Publish shell** for `hook`, npm name `@fe-monorepo/hook`; `react`/`react-dom` as its only peers | `./*` |

The two shells are the only workspaces Changesets versions and `npm publish` touches; `.changeset/config.json`
sets `privatePackages.version: false`, so a release plan can name nothing else (ADR-0004).

## `tooling/`

- `tailwind/` — `@monorepo/tailwind-config`: `theme.css`, `globals.css`, `postcss-config.mjs`. Exports
  `./theme`, `./globals`, `./postcss-config`.
- `typescript/` — `@monorepo/tsconfig`: `base.json` (strict, `noUncheckedIndexedAccess`, `checkJs`) and
  `compiled-package.json`, a **typecheck** preset despite its name (extends `base.json`, adds
  `jsx: "preserve"`, `module: "ESNext"`, `allowJs`, the `next` TS plugin, still `noEmit`); its one consumer
  is `packages/ui/tsconfig.json`. What builds a publishable `dist/` is each source package's own
  `rslib.config.ts` + `tsconfig.build.json`.

## Root

```text
turbo/generators/     three plop generators: `package`, `tooling`, `app`. `app` prompts for the Runtime, clones the
                      Template, rewrites name / Dockerfile ARGs / root scripts / `ports.env`, installs, formats. A Runtime
                      is one entry in the `RUNTIMES` record. Run through the `gen` binary, never `bunx turbo gen`
.agents/  (= .claude) rules/ (52 rules, 12 clusters, + `_sections.md`, `_template.md`) · skills/ (38 vendored — owners in
                      `workflow.md` §1) · plans/ (the former tracker, frozen — `workflow.md` §3) · commands.md ·
                      knowledge-base.md · workflow.md · project-structure.md · README.md · settings.json
docs/
├── adr/              ADR-0001 legacy apps outside the workspace (since deleted) · 0002 one i18n package, many Flavors ·
│                     0003 env Flavors with native prefixes · 0004 npm publish through a Publish shell · 0005 the React
│                     Router Runtime · 0006 the third env Flavor · 0007 SSR auth via cookie session + middleware ·
│                     0008 portfolio neubrutalist override · 0009 documents Prism override · 0010 hook Derived from
│                     hooks-ts · 0011 smart-rental palette override · 0012 smart-rental derived state + Mock by contract ·
│                     0013 smart-rental Kỳ as the monthly unit · 0014 refresh-token opt-in on `createHttpClient` ·
│                     0015 smart-rental World read seam + invalidate-all · 0016 chat Islands layout
├── design/           design briefs, one per round (`<app>-<round>.md`) with the static HTML mockups beside each in
│                     `<app>-<round>/mockup-*.html` (committed, Biome-ignored). A record at the moment of deciding;
│                     the app's shape afterwards is its README
├── agents/           config the workflow skills read: `issue-tracker.md` · `triage-labels.md` · `domain.md`
├── guides/           `skills-workflow.md` — the human walkthrough (Vietnamese)
└── research/         background research notes
.github/workflows/    `ci.yml` — the Gate (`check` · `typecheck` · `test` · `build`) + three non-blocking jobs (`docker`,
                      `changeset-status`, `publish-smoke`); `release.yml` — publish on `main` only; its **file name is
                      load-bearing** (npm's trusted publisher is configured against it)
.changeset/           release notes + `config.json` (`privatePackages.version: false`); written with `bun run changeset`
CLAUDE.md             the agent guide; `AGENTS.md` is a symlink to it
CONTEXT.md · CONTEXT-MAP.md   the root glossary and the map of per-workspace glossaries
.env.example          the ONE env template — both prefix groups; copy to `.env` at the root
package.json          `workspaces.packages` (`apps/*`, `packages/*`, `tooling/*`) + Bun catalogs
biome.json            the ONE lint/format config
skills-lock.json      pins the 25 `skills`-CLI skills by source + content hash
.mcp.json             MCP servers at project scope: Context7 + GitNexus, no credentials
bunfig.toml · bun.lock · turbo.json · .nvmrc · .gitattributes · .dockerignore · .vscode/
```

## Data flow notes — Env and Flavor

The three data-flow diagrams and the one-way rule are in `CLAUDE.md` §2. Reversing an arrow (a service
importing a component, a route module holding business logic, an HTTP call inside JSX) is a hard review
block — `rules/architecture-circular-dependencies.md`, `rules/architecture-features-modules.md`.

Two things hold identically in both server-rendered diagrams: **both paths go through the same service
singleton** (one mock seam, no second HTTP layer), and **one value never lives in both** — no
`dehydrate` / `<HydrationBoundary>` mirroring a server read into the query cache. Which read goes where:
`rules/next-data-fetching.md` (Next), `rules/reactrouter-loader-vs-query.md` (React Router).

**Env.** One `.env` at the root, gitignored, copied from `.env.example`. It holds both prefix groups —
`PUBLIC_` (Vite + React Router) and `NEXT_PUBLIC_` (Next) — plus unprefixed server secrets; a value both
groups need is written twice, on purpose (ADR-0003). How each Runtime reaches it: a Vite app through
`envDir: "../../"` + `envPrefix: "PUBLIC_"` in `vite.config.ts` (inlined at build); a Next app through
dotenv-cli in its scripts (`NEXT_PUBLIC_*` inlined at build, server keys in `process.env`); a React Router app
through both (Vite inlines `PUBLIC_*` into both bundles, dotenv-cli puts the server secret in `process.env`).
No Runtime injects env at runtime. Each app's `~/env.ts` holds the schema **and** the `createEnv` call in one
file — never a separate `env-schema.ts` — so the Dockerfile's `import './src/env.ts'` check and the app parse
the same schema; a bad value fails the image build. Biome's `noProcessEnv` forbids reading `process.env`
anywhere else (`**/env.ts` and `**/*.config.*` exempted). The script-level mechanics and the per-Flavor
gotchas are in `commands.md` § dotenv-cli and `knowledge-base.md` § Environment.

**Flavor.** A package that depends on the Runtime splits along a subpath, and the Runtime-independent half
sits outside every Flavor. `@monorepo/i18n` keeps one language registry and one ICU catalogue; the i18next
Flavor reads them through `i18next-icu`, the next-intl Flavor natively — so a new language or a fixed string
is one edit for every app (ADR-0002). A Flavor is not one Runtime's private half: Vite and React Router share
the i18next Flavor. `@monorepo/env` splits `vite/`, `next/`, `react-router/` with `http-url` shared; the third
re-declares its base keys because **a Flavor never imports another Flavor** (ADR-0003, ADR-0006).
`@monorepo/sentry` has only a Next Flavor; `api`, `types`, `hook`, `dayjs`, `ui` have none. Naming the
Flavor in the import path is the mechanism that keeps one Runtime's app from pulling another's half — never
re-export one Flavor from another or add a root entry that hides the choice.
