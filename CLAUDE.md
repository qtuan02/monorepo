# Personal Monorepo — Agent Guide

> Single reference for AI agents working on this monorepo. Read **§1 Project Structure** and **§2 Data Flow** before touching any code; then jump to the matching rule in **§4 When to Read What**.
>
> Two things decide almost every question here, and they are named in [`CONTEXT.md`](./CONTEXT.md): a **Runtime** (how an app executes — Vite client SPA, or Next.js App Router) and a **Flavor** (the Runtime-specific half of a shared package, living under its own subpath). Get the Runtime right first; the Flavor, the Template app to clone, and the rule cluster to read all fall out of it.
>
> `AGENTS.md` is a **symlink to this file** — one guide, two names, so a tool looking for either finds the same content. `.claude` is likewise a symlink to `.agents`. Both are git mode `120000`; see the README for cloning them on Windows.
>
> This guide and the **GitNexus — Code Intelligence** block at the bottom are two different things. The guide is the project's own architecture and conventions; the GitNexus block sits between the `gitnexus:start` / `gitnexus:end` markers and is rewritten by `npx gitnexus analyze`. Edit the guide freely; never hand-edit inside those markers.

---

## §1 · Project Structure (Turborepo + Bun workspaces)

```text
monorepo/
├── apps/
│   ├── _template_vite/          ← Template app for the **Vite client Runtime** — SPA, nginx. Clone this for an app behind a login that no crawler needs. `@monorepo/_template_vite`, dev 3000 / E2E 3100, both declared in its `ports.env`
│   │   ├── src/
│   │   │   ├── assets/icons/   ← images the bundler owns (`vn.svg`, `gb.svg`, imported by `components/select/select-language.tsx`)
│   │   │   ├── components/     ← composites reused by MORE THAN ONE slice
│   │   │   │   ├── exception/  ← not-found · coming-soon · internal-server-error (the react-error-boundary fallback)
│   │   │   │   └── select/     ← select-language.tsx (the header and the sign-in screen both render it)
│   │   │   ├── constants/      ← routes.ts (the ONE path table) · cookies.ts
│   │   │   ├── features/<feat>/ ← `auth` · `home` · `layout`, each a complete vertical
│   │   │   │   ├── components/ ← feature UI (default-export)
│   │   │   │   ├── provider/   ← route wrappers this slice exposes to the route tree — `auth/provider/{protected,guest}-route.tsx`
│   │   │   │   ├── templates/  ← top-level composition, `<name>.template.tsx` (default-export)
│   │   │   │   └── types/      ← Zod schemas and feature-local types
│   │   │   ├── hooks/api/      ← TanStack Query wrappers — one file per backend resource (`template.ts`)
│   │   │   ├── libs/           ← the wiring sites: `http-client.ts` (service singletons) · `i18n.ts` (i18next Flavor) · `dayjs.ts` (the i18n↔dayjs bridge) · `query-client.ts` · `query-key-factory.ts`
│   │   │   ├── pages/          ← `main.tsx` (route tree + providers — the only page with logic) and thin `<feat>-page.tsx` wrappers
│   │   │   ├── stores/         ← Zustand (`use-auth-store.ts` — the token, persisted)
│   │   │   ├── env.ts          ← `createEnv(baseEnvSchema, import.meta.env)` from the **`vite` Flavor** of `@monorepo/env`
│   │   │   ├── index.tsx · globals.css · vite-env.d.ts
│   │   ├── test/               ← Vitest specs, mirrors the `src/` path of the file under test
│   │   ├── e2e/                ← Playwright specs, `*.e2e.ts` (Vitest never collects these) + `support/auth-session.ts`
│   │   ├── Dockerfile          ← Bun builder (validates env by importing `src/env.ts`) → `nginx:stable-alpine` runner; build-per-env ARGs
│   │   ├── nginx.conf · index.html · public/favicon.png
│   │   ├── vite.config.ts      ← `envDir: "../../"` + `envPrefix: "PUBLIC_"`, React Compiler via `@rolldown/plugin-babel`; `server.port` and `preview.port` both read from `./ports.ts`, `strictPort` on each
│   │   ├── ports.env · ports.ts ← the app's two ports, written once; `ports.ts` reads the file as text and `vite.config.ts` + `playwright.config.ts` both import it. `gen:app` rewrites the two data lines
│   │   ├── README.md · vitest.config.ts · vitest.setup.ts · playwright.config.ts · tsconfig.json · turbo.json
│   ├── _template_next/          ← Template app for the **Next.js Runtime** — App Router, SSR/SEO, Node standalone. `@monorepo/_template_next`, dev 3001 / E2E 3101, both declared in its `ports.env`
│   │   ├── src/
│   │   │   ├── app/[locale]/   ← the path table + framework wiring, and nothing else (see `next-app-router-structure`)
│   │   │   │   ├── layout.tsx  ← the root layout: owns `<html>`, validates the locale with `hasLocale`
│   │   │   │   ├── (shell)/    ← the route group carrying the app shell — `page.tsx` (public home) · `dashboard/` (guarded) · `not-found.tsx` · `[...rest]/`
│   │   │   │   ├── sign-in/    ← outside `(shell)` on purpose: the sign-in screen has no shell chrome
│   │   │   │   └── error.tsx   ← the client-only error boundary
│   │   │   ├── components/     ← `exception/` · `page/` (page-header, page-content) · `select/`
│   │   │   ├── constants/      ← routes.ts (unprefixed paths handed to next-intl's `Link`) · cookies.ts (language + `HttpOnly` session)
│   │   │   ├── features/<feat>/ ← `auth` · `dashboard` · `home` · `layout`
│   │   │   │   ├── actions/    ← Server Actions (`sign-in.ts`, `sign-out.ts`, `refresh-home-catalogue.ts`)
│   │   │   │   ├── guard/      ← the access decision as a PURE function (`session-guard.ts`, `safe-redirect-to.ts`) — this slice's surface toward `proxy.ts`
│   │   │   │   ├── server/     ← cached server reads (`home-catalogue.ts`, `"use cache"` + `cacheTag`/`cacheLife`)
│   │   │   │   ├── components/ · templates/ · types/
│   │   │   ├── hooks/api/      ← TanStack Query — only for what happens AFTER paint
│   │   │   ├── i18n/           ← the three next-intl wiring files: `routing.ts` · `request.ts` · `navigation.ts`
│   │   │   ├── libs/           ← `http-client.ts` (the same service singleton both data paths use) · `query-client.ts` (`getQueryClient()`, not a module singleton) · `query-key-factory.ts`
│   │   │   ├── proxy.ts        ← Next 16's `middleware.ts`, on the **Node** runtime: session guard first, then next-intl locale negotiation
│   │   │   ├── env.ts          ← `createEnv({ server, client, clientRuntimeEnv })` from the **`next` Flavor** (t3-env)
│   │   │   ├── instrumentation.ts · instrumentation-client.ts · sentry-runtime.config.ts
│   │   │   ├── assets/ · globals.css · global.d.ts
│   │   ├── test/ · e2e/        ← the same two trees; E2E fetches the document raw, which is the only place SSR-only behaviour can be asserted
│   │   ├── next.config.ts      ← `cacheComponents` · `reactCompiler` · `output: "standalone"` · `transpilePackages` · next-intl plugin · `withSentry`
│   │   ├── Dockerfile          ← Bun builder → **`node:24-alpine`** runner running `node server.js` as the `node` user
│   │   ├── AGENTS.md · CLAUDE.md ← written and re-added by `next dev` itself; do not hand-edit
│   │   ├── ports.env · ports.ts ← the same two files as the Vite Template, byte-identical `ports.ts`. Here the `dev`/`start` scripts hand `ports.env` to dotenv-cli (Next has no config-level port), and `playwright.config.ts` imports `ports.ts`
│   │   ├── README.md · postcss.config.mjs · playwright.config.ts (E2E port from `./ports.ts`) · vitest.config.ts · tsconfig.json · turbo.json
│   └── storybook/               ← `@monorepo/storybook` — previews `@monorepo/ui` (Storybook 10.6 + `@storybook/react-vite`, `addon-docs` only), port 6006 — its one port literal, the `-p 6006` in `package.json`; deliberately outside the 3000+n / 3100+n bands, and it has no E2E server, so it declares no `ports.env`
│       ├── .storybook/main.ts · preview.tsx
│       ├── src/stories/        ← one `*.stories.tsx` per primitive + `introduction.stories.tsx`
│       ├── test/               ← `stories.test.tsx` (renders every story via `composeStories`) · `form-stories.test.tsx` · `date-picker-stories.test.tsx`
│       └── postcss.config.mjs · Dockerfile · nginx.conf
├── packages/                    ← ten workspaces: eight source packages plus the two **Publish shells**. All eight sources are `private: true`, source-only, subpath-only `exports` into `src/` — every app in this repo imports their `.ts`/`.tsx` directly, with no build step in between. Six of them (`api`, `dayjs`, `env`, `i18n`, `sentry`, `types`) have no `build` task and no `dist/` at all, which is decision 3 unchanged; `ui` and `hook` read exactly the same way inward, but each additionally carries a `build` task (rslib, bundleless — per-file ESM + `.d.ts`) whose output lands in its shell rather than in itself (ADR-0004). Five of them carry their own Vitest runner and a `test/` tree mirroring `src/` — `api`, `dayjs`, `env`, `ui` on the node environment, `i18n` on jsdom; `hook`, `sentry` and `types` have no test script
│   ├── api/                    ← `@monorepo/api` — `createHttpClient` (axios) + `HttpError` + service classes under `src/<system>/<domain>-service.ts`. Placeholder: `template/template-service.ts`. Exports `./*`
│   ├── types/                  ← `@monorepo/types` — domain entities + per-endpoint params (`template.ts`). Exports `./*`
│   ├── hook/                   ← `@monorepo/hook` — generic React hooks (`use-debounce`, `use-media-query`, `use-is-mobile`, `use-copy-to-clipboard`, `use-isomorphic-layout-effect`). Exports `./*`
│   ├── dayjs/                  ← `@monorepo/dayjs` — the configured singleton + `formats` + `locales` + `set-locale`. The ONE package with a root entry (`.` → `src/dayjs.ts`), because its root *is* the singleton
│   ├── env/          **Flavor** ← `@monorepo/env`. Runtime-free: `./http-url`. Vite Flavor: `./vite/create-env`, `./vite/schema` (prefix `PUBLIC_`, `import.meta.env`). Next Flavor: `./next/create-env`, `./next/schema` (t3-env, prefix `NEXT_PUBLIC_`). See ADR-0003 and `packages/env/README.md`
│   ├── i18n/         **Flavor** ← `@monorepo/i18n`. Shared: `./languages` (the registry) + `src/locales/<code>.json` in **ICU MessageFormat** + `./change-language`. i18next Flavor: `./i18next/create-i18n` (reads ICU through `i18next-icu`). next-intl Flavor: `./next-intl/{create-routing,create-request-config,create-proxy,proxy-matcher,provider}`. See ADR-0002
│   ├── sentry/       **Flavor** ← `@monorepo/sentry` — a `@sentry/nextjs` wrapper with a **Next Flavor only** (`client`, `server`, `edge`, `next-config`, `options`, `capture-request-error`). A Vite app never depends on it
│   ├── ui/                     ← `@monorepo/ui` — 63 shadcn primitives in the `base-vega` style, on Base UI. Exports `./components/*` and `./utils/*` only. Internally uses Node subpath imports (`#components/*`, `#utils/cn`, `#hooks/*`); `scripts/guard-no-local-hooks.ts` keeps `#hooks/*` an empty landing pad so a generic hook lands in `@monorepo/hook`. Its runner covers the framework-free utils only — the primitives themselves are covered by `apps/storybook`. `scripts/build.ts` (rslib + a CSS step) fills `ui-public/dist`, inlining the one hook it uses so no `@monorepo/*` or `#…` specifier survives into the output
│   ├── ui-public/              ← the **Publish shell** for `@monorepo/ui`, published to npm as **`@fe-monorepo/ui`**. It holds a hand-written `package.json` — literal dependency ranges, never `catalog:` and never `workspace:`, because npm can resolve neither — plus a README written for a consumer rather than for this repo; its `dist/` is written by `@monorepo/ui`'s `build` and is **gitignored**. Publishes subpaths only (`./components/*`, `./utils/*`) plus the one CSS entry `./globals.css`
│   └── hook-public/            ← the **Publish shell** for `@monorepo/hook`, published as **`@fe-monorepo/hook`** — the same shape, `exports: "./*"`, and `react`/`react-dom` as its only peers. These two shells are the ONLY workspaces Changesets versions and `npm publish` ever touches: every other package is `private: true` and `.changeset/config.json` sets `privatePackages.version: false`, so a release plan can name nothing else. See ADR-0004
├── tooling/
│   ├── tailwind/               ← `@monorepo/tailwind-config` — `theme.css`, `globals.css`, `postcss-config.mjs`. Exports `./theme`, `./globals`, `./postcss-config`
│   └── typescript/             ← `@monorepo/tsconfig` — `base.json` (strict, `noUncheckedIndexedAccess`, `checkJs`) + `compiled-package.json`, which despite its name emits nothing: it extends `base.json` and adds `jsx: "preserve"`, `module: "ESNext"`, `allowJs` and the `next` TS plugin, all still under `noEmit` — a **typecheck** preset, whose one consumer is `packages/ui/tsconfig.json`. What actually builds a publishable `dist/` is each source package's own `rslib.config.ts` + `tsconfig.build.json`, in `packages/ui` and `packages/hook`
├── legacy/                      ← everything that predates the Skeleton, frozen. **Outside `workspaces.packages`**, so `bun install`, `turbo run …` and `biome check .` never reach it (ADR-0001, and `biome.json` excludes it explicitly). Six old apps (`_template`, `portfolio`, `assistant-ai`, `mcp`, `documents`, `storybook`), two published packages (`ui-public`, `hook-public` — the frozen originals of those names, **not** the live Publish shells now in `packages/`), the old `.changeset/` and the old `docs/`. Git history is intact; nothing here is maintained. Each app comes back into `apps/` through its own migrate ticket — the table of app → Runtime → target Template is in [`legacy/README.md`](./legacy/README.md). **Never** wire anything here back into the root install to "fix" it
├── turbo/generators/            ← three plop generators: `package`, `tooling`, `app`. `app` prompts for the **Runtime** (`next` | `vite`), clones the matching Template app, rewrites its name / Dockerfile ARGs / root scripts, then installs and formats. Run through the `gen` binary, never `bunx turbo gen` (it truncates arguments on Windows)
├── .agents/                     ← AI resources  [`.claude` → `.agents` symlink, git mode 120000 — clone with `core.symlinks=true`]
│   ├── rules/                  ← 46 rules across 11 prefix clusters (+ `_sections.md`, `_template.md`)
│   ├── skills/                 ← 31 vendored skills. The 25 from `mattpocock/skills` (23) and `vercel-labs/agent-skills` (2) are pinned in `skills-lock.json`; the six `gitnexus-*` are **not** in the lock — `gitnexus analyze` owns them
│   ├── plans/                  ← the tracker (§7b, §9): one folder per topic, `spec.md` + `NN-*.md`
│   ├── commands.md             ← the full command reference (§6 is its short form)
│   ├── knowledge-base.md       ← project facts and gotchas that no single file shows
│   ├── README.md               ← the per-rule index
│   └── settings.json           ← `plansDirectory`
├── docs/
│   ├── adr/                    ← ADR-0001 (legacy outside the workspace) · ADR-0002 (one i18n package, many Flavors, ICU messages) · ADR-0003 (env two Flavors, native prefixes) · ADR-0004 (npm publish through a Publish shell)
│   ├── agents/                 ← the config the workflow skills read: `issue-tracker.md` (the `.agents/plans/` layout) · `triage-labels.md` · `domain.md` (§9)
│   └── research/               ← background research notes
├── .github/workflows/           ← `ci.yml` — the Gate on GitHub Actions: `check` · `typecheck` · `test` · `build` blocking, plus four non-blocking jobs (`e2e`, `docker`, `changeset-status`, `publish-smoke`). `release.yml` — the publish path for the two shells, on `main` only; its **file name is load-bearing**, because npm's trusted publisher is configured against it (ADR-0004)
├── .changeset/                  ← the release notes Changesets consumes, plus `config.json` (`privatePackages.version: false`). Written with `bun run changeset`, never by hand-bumping a shell's `version`
├── CLAUDE.md ← this file. `AGENTS.md` is a symlink to it, so `gitnexus analyze` updating "both" writes one file
├── CONTEXT.md · CONTEXT-MAP.md  ← the root glossary and the map of per-workspace glossaries
├── .env.example                 ← the ONE env template — both prefix groups in one file; copy to `.env` at the root
├── package.json                 ← `workspaces.packages` (`apps/*`, `packages/*`, `tooling/*`) + Bun catalogs
├── biome.json                   ← the ONE lint/format config — no per-package configs, no Turbo lint task
├── skills-lock.json             ← pins every vendored skill by source repo + content hash (§7)
├── .mcp.json                    ← MCP servers at project scope: Context7 (http) + GitNexus. No credentials in it — a Context7 API key belongs in your user-level config
└── bunfig.toml · bun.lock · turbo.json · .nvmrc · .gitattributes · .dockerignore · .vscode/
```

---

## §2 · Data Flow (one direction only, in both Runtimes)

**Vite Runtime** (`_template_vite` and its clones):

```text
.env (repo root) → import.meta.env → ~/env.ts → @monorepo/api → ~/libs/http-client.ts → ~/hooks/api/<domain>.ts
            → ~/features/<feat>/{hooks,components,templates} → ~/pages/<feat>-page.tsx
```

**Next Runtime** (`_template_next` and its clones) — the same graph with the top layer substituted and a **second** path into it:

```text
.env (repo root, via dotenv-cli) → process.env → ~/env.ts → @monorepo/api → ~/libs/http-client.ts
     ├── ~/features/<feat>/server/*.ts   ("use cache" — what the first HTML and `generateMetadata` are built from)
     └── ~/hooks/api/<domain>.ts         (TanStack Query — everything after paint)
            → ~/features/<feat>/{components,templates} → src/app/[locale]/**/page.tsx
```

Reversing any arrow (a service importing a component, a route module holding business logic, an HTTP call inside JSX) is a hard review block. See `.agents/rules/architecture-circular-dependencies.md` and `.agents/rules/architecture-features-modules.md`.

Two things about the Next diagram are load-bearing. **Both paths go through the same service singleton**, so there is one mock seam and no second HTTP layer to keep in sync. And **one value never lives in both** — mirroring a cached server read into the query cache (`dehydrate` / `<HydrationBoundary>`) gives it two owners and two staleness rules, which is why this template ships neither. Which read belongs in which path is `.agents/rules/next-data-fetching.md`.

> **Env:** the one source of truth is `.env` at the monorepo root (gitignored), copied from the committed `.env.example`. It holds **both** prefix groups, and neither maps onto the other — a value both Runtimes need is spelled twice, on purpose (ADR-0003). A Vite app reaches it through Vite's `envDir: "../../"` + `envPrefix: "PUBLIC_"` (set in `apps/<app>/vite.config.ts`), which bakes `import.meta.env.PUBLIC_*` into the bundle at build time. A Next app reaches it through **dotenv-cli** — `dotenv -e ../../.env -- next dev` in its own scripts — because `next dev`/`next build` only read a `.env` inside the app directory; `NEXT_PUBLIC_*` is then inlined by Next at build time, and unprefixed server keys stay in `process.env`. There is no runtime injection in either Runtime.
>
> Each app's `~/env.ts` calls its Flavor's `createEnv`, which Zod-validates and throws immediately on a missing or invalid value, then exports the typed `env` object. Docker images are built **per environment**: the Dockerfile validates by importing that very module before the bundler runs, so a bad value fails the build rather than the container boot. Biome's `noProcessEnv` + `noRestrictedImports` (scoped to `apps/**` in the root `biome.json`, with `**/env.ts` and `**/*.config.*` exempted by an override, and a second override for `apps/*/scripts/**`) forbid reading `process.env` anywhere else.
>
> An app that adds a key of its own extends the schema **in `env.ts` itself** — one file holding the schema and the `createEnv` call — and adds the key with a dev value to the root `.env.example`. There is no separate `env-schema.ts`: the Dockerfile validates the image by importing that same module, so the check and the app parse the same schema by construction, with nothing to keep in sync.

> **Flavor:** a package that depends on the Runtime splits along a subpath, and the Runtime-independent half sits outside every Flavor. `@monorepo/i18n` keeps one language registry and one set of `locales/<code>.json` in ICU MessageFormat — the i18next Flavor reads them through `i18next-icu`, the next-intl Flavor reads them natively — so adding a language or fixing a string is one edit for every app (ADR-0002). `@monorepo/env` keeps `http-url` shared and splits `vite/` from `next/` (ADR-0003). `@monorepo/sentry` has only a Next Flavor. `@monorepo/{api,types,hook,dayjs,ui}` have no Flavor at all. **Naming the Flavor in the import path is the mechanism** — it is what stops a Next app from pulling the Vite half, so never re-export one Flavor from the other or add a root entry that hides the choice.

---

## §3 · "Where do I put X?" Quick Lookup

| I want to add…                                | Put it in…                                                                                                                                                                          | Rule                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| A whole new app — **which Template?**         | Needs SEO / a public indexable page / content before JS loads → `bun run gen:app` and pick Runtime `next` (clones `apps/_template_next`). Internal, behind a login, no crawler → Runtime `vite` (clones `apps/_template_vite`). Never hand-copy a template. `gen:app` assigns the clone the next free pair (dev 3000+n, e2e 3100+n) into its own `ports.env`, the one place it states them — so start it beside its Template once to confirm, rather than hand-picking numbers; a green `bun run e2e` is not that confirmation, because Playwright reuses a server already on the port and a collision reads as a pass. | `next-app-router-structure.md`, `routing-constants.md`                   |
| A backend endpoint (HTTP)                     | `packages/api/src/<system>/<domain>-service.ts` (folder = backend system, file = domain; class `<System><Domain>Service`) → instantiate in `~/libs/http-client.ts` → wrap in `~/hooks/api/<domain>.ts`                                              | `architecture-features-modules.md`, `tanstack-key-factory.md`            |
| A shadcn primitive                            | `packages/ui/src/components/` via `bun run --filter @monorepo/ui ui-add` — never hand-copied into an app                                                                             | `architecture-ui-primitives.md`                                          |
| A generic React hook (debounce, media query…) | `packages/hook/src/use-<name>.ts`. Not `packages/ui/src/hooks/` — the `#hooks/*` alias exists only so the shadcn CLI will run, and the directory must not exist; `guard:no-local-hooks` fails `ui-add` if the CLI scaffolds one                        | `architecture-feature-boundaries.md`, `quality-imports.md`               |
| A change to what `ui` / `hook` **publish**    | The code still goes in `packages/{ui,hook}/src/`; the *published surface* is the shell — edit `packages/<name>-public/package.json` (its `exports`, its literal dependency ranges, its peers) and that shell's consumer README, then record the change with `bun run changeset` so the version bump and the CHANGELOG entry come from one place. Never hand-edit a shell's `dist/` or its `version` — the first is gitignored build output, the second belongs to Changesets | ADR-0004                                                                 |
| A translation string                          | `packages/i18n/src/locales/<code>.json`, in **ICU MessageFormat** — `{name}`, never `{{name}}`; one `{count, plural, …}` message, never a `_one`/`_other` key pair; and **no rich-text tag** (`<b>`, `<link>`), the one construct the two Flavors cannot agree on. `catalogue-invariants.test.ts` enforces all three | ADR-0002, `next-i18n-next-intl.md`, `.agents/knowledge-base.md` § Internationalization |
| A new language                                | `packages/i18n/src/languages.ts` + `packages/i18n/src/locales/<code>.json`. Nothing in `apps/` changes; the typed `messages` map fails to compile until the JSON exists              | ADR-0002, `.agents/knowledge-base.md` § Internationalization              |
| A date/time display format                    | `packages/dayjs/src/formats.ts` — never an inline format string at a call site                                                                                                       | `dates-dayjs-singleton.md`                                               |
| A dayjs plugin, or a dayjs locale             | `packages/dayjs/src/dayjs.ts` (`dayjs.extend(...)` / `import "dayjs/locale/<code>"`), plus `src/locales.ts` for a locale. Never extend from an app                                    | `dates-dayjs-singleton.md`                                               |
| A feature screen (either Runtime)             | `apps/<app>/src/features/<feat>/{components,templates,hooks}` — templates are `<name>.template.tsx`, default-exported                                                                | `architecture-vertical-slices.md`, `architecture-shared-components.md`   |
| A new route (**Vite** app)                    | `~/constants/routes.ts` + the tree in `~/pages/main.tsx` + a thin `~/pages/<feat>-page.tsx`                                                                                          | `routing-constants.md`, `routing-route-guards.md`                        |
| A new route (**Next** app)                    | A folder under `src/app/[locale]/` with a thin `page.tsx` that renders the slice's template and adds `generateMetadata`. Add the unprefixed path to `~/constants/routes.ts` and navigate with next-intl's `Link` — never a literal `/vi/...` | `next-app-router-structure.md`, `next-i18n-next-intl.md`                 |
| A route guard / auth gate (**Vite** app)      | `~/features/auth/provider/<name>-route.tsx` (default export, no props) + wrap the route group in `~/pages/main.tsx`                                                                   | `routing-route-guards.md`                                                |
| A route guard / auth gate (**Next** app)      | A **pure function** in `~/features/auth/guard/`, called from `src/proxy.ts` over the `HttpOnly` session cookie. Never a component that decides while rendering — the server has already sent the bytes by then | `next-proxy-guards.md`                                                   |
| Data for a screen (**Next** app)              | Does a crawler need it in the first HTML? → `~/features/<feat>/server/*.ts` with `"use cache"` + `cacheTag`/`cacheLife`. Is it interaction after paint? → `~/hooks/api` + TanStack Query. Both go through the same service singleton; one value never lives in both | `next-data-fetching.md`                                                  |
| A Zustand store                               | `~/stores/use-<name>-store.ts` (app-wide) or a feature slice's `stores/`. A **Next** app has neither: its session is an `HttpOnly` cookie, and putting a token in a persisted store undoes exactly that | `zustand-global.md`, `zustand-feature.md`, `next-proxy-guards.md`        |
| A form schema                                 | `~/features/<feat>/types/<form>-form.ts` (Zod + `z.infer`), with `import * as z from "zod"`                                                                                          | `forms-schema-driven.md`, `forms-field-components.md`                    |
| A **type** — which of the two homes?          | Backend owns the shape (entity, endpoint params, response payload) → `packages/types/src/<domain>.ts`, because `@monorepo/api` must import it and a package cannot reach into an app. Only this app knows it → `apps/<app>/src/types/` or the slice's `types/` | `architecture-features-modules.md`                                       |
| An env variable                               | Add it (with a dev value) to the root `.env.example` under the right prefix group, then extend the schema inside that app's `src/env.ts` — `baseEnvSchema.extend()` for a Vite app, a `server`/`client` entry plus a literal `clientRuntimeEnv` read for a Next app. Docker build ARGs must be updated to match | ADR-0003, `next-env-t3.md`                                               |
| A Tailwind class string                       | Inline in the `className` at the call site. Do **not** lift it into `~/constants/*.ts` and import it back. A shared layout measurement that several sibling files must agree on is the one exception, and it stays as close to those files as possible | `quality-styling-tailwind.md`                                            |
| An image the UI renders (icon, illustration)  | `apps/<app>/src/assets/<group>/<name>.<ext>`, reached with an **import** — never a `public/` URL string in JSX, which no bundler resolves and therefore nothing checks. `public/` keeps only what must be fetched by a fixed, unhashed name | `quality-imports.md` § Static assets                                     |
| Cross-feature shared code                     | Promote `~/features/<feat>/…` → `~/{components,hooks,utils}`; if used in 2+ apps → `@monorepo/*`, and if it depends on the Runtime, as a **Flavor** subpath rather than a second package | `architecture-feature-boundaries.md`, `architecture-shared-components.md` |
| A unit / component test                       | `apps/<app>/test/<same path as under src>/<source>.test.ts(x)` — the `test/` tree mirrors `src/`; nothing under `src/` is a test                                                     | `testing-coverage.md`                                                    |
| An E2E flow                                   | `apps/<app>/e2e/<flow>.e2e.ts` (Playwright; the `.e2e.ts` suffix keeps it out of Vitest)                                                                                             | `testing-playwright.md`                                                  |
| An architectural decision worth recording     | `docs/adr/NNNN-<slug>.md` (Vietnamese, `status` + `date` front-matter). A glossary term goes in `CONTEXT.md`; a per-workspace term in that workspace's own `CONTEXT.md`, registered in `CONTEXT-MAP.md` | §8, §9                                                                   |

### Path Aliases

- `~/*` → `./src/*` — a tsconfig `paths` alias defined **per-app** in `apps/<app>/tsconfig.json`. It reads identically in both Runtimes. Vite resolves it from tsconfig; Next resolves it from the same file.
- `@monorepo/<name>` → a workspace package, resolved by **Bun workspaces + each package's `exports`** field (not a tsconfig path). Every package is subpath-only — `@monorepo/ui/components/button`, `@monorepo/api/client`, `@monorepo/env/next/create-env`. `@monorepo/dayjs` is the single package with a root entry, because its root is the configured singleton.
- `#components/*` · `#utils/cn` · `#hooks/*` — Node subpath imports declared in `packages/ui/package.json`, used **only inside `packages/ui/src`**, so a `shadcn add --overwrite` writes files that are byte-identical to upstream. They resolve only from inside that package, which is why `@monorepo/ui`'s build rewrites every one of them away before the output reaches `ui-public/dist` (ADR-0004).
- `@fe-monorepo/<name>` is the **npm** name of a Publish shell, not an alias — `@fe-monorepo/ui` is what an outside consumer installs, `@monorepo/ui` is what this repo imports. Deliberately two names (decision 4); never write `@fe-monorepo/*` in an app or a package here.
- Never use `@/*`, or a deep relative chain (`../../components`) inside `src/`.

### Tech Stack

Shared by both Runtimes: React 19 (no `forwardRef`; **React Compiler on in both templates**) · TanStack Query v5 · Zod v4 + React Hook Form v7 · Tailwind v4 (`@monorepo/tailwind-config`, no per-app config) · shadcn `base-vega` on Base UI (`@monorepo/ui`) · lucide-react · dayjs (`@monorepo/dayjs`) · axios via `HttpClient` (`@monorepo/api`) · TypeScript 7 strict · Biome 2 (formatter + linter + import sorting, one root config) · Vitest 5 + RTL · Playwright 1.62 · **Bun + Turbo**.

**Vite Runtime:** Vite 8 + `@vitejs/plugin-react` 6 + `@rolldown/plugin-babel` · React Router **8 declarative** — one package: components and hooks come from `react-router`, and the DOM entry points (`RouterProvider`, `HydratedRouter`) from `react-router/dom`. There is no `react-router-dom` any more, and the template imports only from `react-router` · Zustand v5 · i18next Flavor · nginx runner.
**Next Runtime:** Next 16 App Router (`cacheComponents`, `reactCompiler`, Turbopack, `proxy.ts`, `output: "standalone"`) · next-intl Flavor · t3-env Flavor · `@monorepo/sentry` · `node:24-alpine` runner.

---

## §4 · When to Read What

| Task                                       | Read first                                                                             | Then                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Start any non-trivial task**             | §1–§3 above + `architecture-vertical-slices.md` + `architecture-circular-dependencies.md` | the matching rule(s) below                                                                              |
| **Work in a Next app**                     | `next-app-router-structure.md` + `next-server-vs-client-components.md`                  | `next-data-fetching.md`, `next-proxy-guards.md`, `next-i18n-next-intl.md`, `next-env-t3.md`             |
| **Work in a Vite app**                     | `routing-constants.md` + `routing-route-guards.md`                                      | `architecture-vertical-slices.md`, `zustand-global.md`                                                   |
| **Add / change a backend HTTP call**       | `architecture-features-modules.md`                                                      | `tanstack-key-factory.md`, `tanstack-use-query.md` / `…-use-mutation.md` / `…-use-infinite.md`           |
| **Read server state in a component**       | `tanstack-consume-query.md`                                                             | `patterns-self-fetching-components.md`, `patterns-loading-skeletons.md`, `patterns-parallel-fetching.md` |
| **Submit / mutate data**                   | `tanstack-consume-mutation.md`                                                          | `tanstack-use-mutation.md`, `forms-schema-driven.md`                                                     |
| **Decide server cache vs TanStack Query**  | `next-data-fetching.md`                                                                 | `next-server-vs-client-components.md`, `testing-playwright.md` (the raw-HTML assertion that proves it)  |
| **Add / change a UI primitive**            | `architecture-ui-primitives.md`                                                         | `quality-styling-tailwind.md`                                                                            |
| **Add / change a feature screen**          | `architecture-vertical-slices.md`                                                       | `architecture-feature-boundaries.md`; then the Runtime's routing rule (`routing-*` or `next-*`)          |
| **Add / change a form**                    | `forms-schema-driven.md`                                                                | `forms-field-components.md`, `forms-use-watch.md`                                                        |
| **Add / change a Zustand store**           | `zustand-global.md` / `zustand-feature.md`                                              | `tanstack-consume-query.md` (server data stays in Query, not a store)                                    |
| **Add a translation or a language**        | ADR-0002 + `packages/i18n/src/languages.ts`                                             | `next-i18n-next-intl.md` (Next), `dates-locale-render-input.md` (anything locale-sensitive on screen)    |
| **Touch env / add a variable**             | ADR-0003 + `packages/env/README.md`                                                     | `next-env-t3.md` (Next), §2 Env note (Vite)                                                              |
| **Design the API surface of a component**  | `react-no-forwardref.md`, `react-no-inline-components.md`                               | `quality-list-keys.md`, `react-effects-sync-only.md`                                                     |
| **Write or fix a test**                    | `testing-coverage.md`                                                                   | `testing-playwright.md` for anything needing a real browser or a real server                             |
| **Bring a `legacy/` app back into `apps/`** | `legacy/README.md` + ADR-0001                                                            | the Template app for its Runtime, then that Runtime's rule cluster                                       |

> If your task is not covered above: scan `.agents/rules/` filenames (kebab-case topical) and skim the 2–3 most likely matches. Rule file shape is in `.agents/rules/_template.md`.

---

## §5 · Rule Clusters

`.agents/rules/` holds **46 rules across 11 prefix clusters** — one concern per file.

| Cluster          | What it covers                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture-*` | Vertical slices, one-way import layering, feature boundaries, `@monorepo/api` services vs `~/hooks/api`, `@monorepo/ui` primitives, shared composites |
| `routing-*`      | The **Vite Runtime** only: the `ROUTES` constant, route-tree guards, React Router 8 declarative imports                                              |
| `next-*`         | The **Next Runtime**: thin route modules, the Server-Component default, the server-cache vs Query boundary, `proxy.ts` guards, next-intl, t3-env    |
| `react-*`        | React 19 — `ref` as a prop (no `forwardRef`), no inline components, effects sync-only                                                                |
| `quality-*`      | Clarity over cleverness, import/export conventions, no barrels, comments, stable list keys, Tailwind styling                                          |
| `forms-*`        | Zod schema-driven forms + the `@monorepo/ui` `field` primitives                                                                                      |
| `tanstack-*`     | TanStack Query v5 — key factory, defining (`use-*`) and consuming (`consume-*`) query/mutation/infinite hooks                                        |
| `patterns-*`     | Screen fetching/rendering — parallel, fetch-on-mount, self-fetching components and inputs, hooks-over-context, skeletons, debounce                   |
| `zustand-*`      | Zustand v5 client state — app-wide (`global`) vs feature-scoped (`feature`)                                                                          |
| `dates-*`        | dayjs via `@monorepo/dayjs` — the configured singleton, the formats table, the locale registry, and passing the language into render                 |
| `testing-*`      | Which runner owns what — Vitest 5 + RTL under `apps/<app>/test/` mirroring `src/`, Playwright for `.e2e.ts` — plus what deserves a test, the `TZ=UTC` pin, coverage-without-a-gate. The mock seam itself is §7a below |

Each rule has `impact: CRITICAL | HIGH | MEDIUM` in its front-matter. Treat `CRITICAL` and `HIGH` as non-negotiable for any new code.

> **Full per-rule index → [`.agents/README.md`](.agents/README.md)** — every rule grouped by cluster with a one-line summary. Section registry (prefixes, impact, ordering) → [`.agents/rules/_sections.md`](.agents/rules/_sections.md). Rule file shape → [`.agents/rules/_template.md`](.agents/rules/_template.md).
>
> The reference monorepo carries three further rules for a **React Router framework mode** Runtime (`routing-typed-href`, `routing-middleware-guards`, `patterns-loader-vs-query`). They were deliberately left out because this repo has no such Template app; restore them from the reference the day one arrives.

---

## §6 · Commands

Run these from the repo root unless noted. Root scripts delegate to `turbo run <task>`; Biome runs once from the root with no Turbo fan-out. [`.agents/commands.md`](.agents/commands.md) is the long form — same commands, with the constraint attached to each.

```bash
bun install                      # install workspace dependencies (bun.lock, bunfig.toml)

bun run dev:template-vite        # the Vite Template app — http://localhost:3000
bun run dev:template-next        # the Next Template app  — http://localhost:3001
bun run dev:storybook            # Storybook               — http://localhost:6006

bun run check                    # Biome: format + lint + import sorting (whole repo, one pass)
bun run check:fix                # Biome with --write (safe fixes)
bun run check:changed            # Biome over the changed files only
bun run typecheck                # tsc --noEmit across the monorepo (Turbo)
bun run test                     # Vitest 5 across every workspace with a `test` script (jsdom + RTL in the apps, node in most packages)
bun run test:coverage            # the same, plus a v8 report — no threshold, nothing gates on it
bun run build                    # build every package and app

bun run e2e                      # Playwright over both Template apps; each webServer builds and serves itself
bun run e2e:headed:template-vite # the same specs in one real browser window (the `watch` project)
bun run e2e:headed:template-next

bun run changeset                # write a release note for a change to @fe-monorepo/ui or @fe-monorepo/hook
bun run publish:smoke            # pack both Publish shells, install them into a throwaway consumer project, build it
bun run release                  # CI ONLY — build:publishable, then `changeset publish`. Never run this by hand

bun run gen:app                  # scaffold a new app — prompts for the Runtime, clones that Template
bun run gen:package              # scaffold a new packages/* workspace
bun run gen:tooling              # scaffold a new tooling/* workspace

bun run clean                    # git clean -xdf node_modules
bun run clean:workspaces         # each workspace's own clean task
bun run --filter @monorepo/ui ui-add   # add a shadcn primitive into packages/ui/src/components/
```

**The Gate** is exactly four of these — `check`, `typecheck`, `test`, `build` — and `.github/workflows/ci.yml` runs the same four commands, so running them locally reproduces CI. Four jobs run outside it, every one carrying `continue-on-error: true`, so they report without blocking. Two of them share one path filter — `e2e` and `docker`, both on the diff touching `apps/`, `packages/`, `tooling/`, `bun.lock` or the workflow — and the other two, `changeset-status` and `publish-smoke`, sit on a second filter of their own (the published surface rather than an app); `ci.yml`'s own header names all four. `e2e` drives Playwright over both Template apps: its container tag must match `@playwright/test` in the `testing` catalog exactly (1.62.1) — bump the two together — and it deliberately does not go through `turbo run`, which would swallow `PLAYWRIGHT_BROWSERS_PATH`. `docker` builds one image per app that ships a Dockerfile, with the matrix derived from `find apps -name Dockerfile` rather than listed, so an app arriving from a migrate ticket is covered with no edit here. It builds only — `push: false`, `load: false`, cache scoped per app — from the repo root as context, and passes no `--build-arg`, because env reaches these images as a file (`COPY .env.${BUILD_ENV} .env`, defaulting to the committed `.env.example`) and `gen:app` has already written each app's `APP_DIRNAME`/`PROJECT` into its own Dockerfile. It never starts a container, so it proves the image builds and nothing about how it runs.

**Publishing** is three commands, and only the first two are yours to run. `bun run changeset` writes a release note into `.changeset/` — that is the whole local ritual for shipping a change to `@fe-monorepo/ui` or `@fe-monorepo/hook`, and it is what the non-blocking `changeset-status` job looks for. `bun run publish:smoke` (`scripts/publish-smoke.ts`) `npm pack`s both shells and installs the tarballs into a throwaway Vite + React 19 + Tailwind v4 project **outside** the workspace, then typechecks and builds it: it is the one seam that proves the *tarball* rather than the source, so a `catalog:` range npm cannot resolve, a surviving `#components/*` specifier, or a subpath missing from `exports` fails here instead of on npm. `bun run release` (`build:publishable`, then `changeset publish`) is **CI only** — `.github/workflows/release.yml` runs it on `main` through `changesets/action`, which first opens a "Version Packages" PR and only publishes once that PR merges. There is no `NPM_TOKEN` anywhere: the workflow authenticates with npm **trusted publishing** over OIDC (`id-token: write`), which is configured on npmjs.com against this repository *and this workflow's file name*, so renaming `release.yml` breaks publishing. Running `release` from a laptop has no credential to use and would publish from an unversioned tree — don't.

Never prefix a test command with `TZ=UTC`: that syntax is invalid in PowerShell and the pin already lives in each `vitest.config.ts`.

Runtime pins: Node **24** (`.nvmrc` `24.20.0`, `engines.node >=24.14.0`, `@types/node` 24.x), Bun **`bun@1.4.0`** (`packageManager`; `engines.bun >=1.2.0`), Turbo 2.10, Biome 2.5.12, TypeScript 7.0. Version pinning for dependencies uses Bun **catalogs** in the root `package.json` — the default `catalog:` plus the named `next16`, `react19`, `react-router8`, `storybook10`, `tailwind4`, `tanstack-query5`, `tanstack-table9`, `testing`. Reference a catalog from a workspace `package.json`; never hardcode a version there.

Per-app `turbo.json` files `extends: ["//"]` and flip `dev.persistent: true` (and, for the Next app, add `.next/types/**` to the `typecheck` outputs) — that is why `dev:*` holds the terminal.

---

## §7 · Skills (`.agents/skills/`)

A skill is a deeper, scenario-shaped guide (longer than a rule, narrower than a doc). Each lives in `skills/<name>/SKILL.md`.

Skills are **vendored** — real files in this repo, not a runtime fetch — and pinned by source repository plus content hash in [`skills-lock.json`](skills-lock.json). Re-sync one with the `skills` CLI (`npx skills@latest update <name>`) rather than hand-editing it, or the hash drifts and `skills experimental_install` can no longer restore it. The workflow skills come from `mattpocock/skills`, two come from `vercel-labs/agent-skills`, and the `gitnexus-*` set is installed by `npx gitnexus analyze` alongside the GitNexus block at the bottom of this file.

The main line runs `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review` → `/handoff`. **Read §7a before running any of them** — it carries this repo's overrides (language, the Standards source for `/code-review`, the tracker, and the TDD loop).

| Skill                           | Read when                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `grill-with-docs`               | Stress-testing a feature idea while building the domain model (drives `domain-modeling` → `CONTEXT.md` + ADRs) |
| `grill-me` / `grilling`         | Stress-testing a plan or decision without touching the domain docs                             |
| `to-spec`                       | Turning a settled decision into a written spec                                                 |
| `to-tickets`                    | Splitting a spec into tickets (markdown, see §9)                                               |
| `implement`                     | Implementing from a spec or tickets (invoke explicitly — not model-invoked)                    |
| `code-review`                   | Reviewing a branch / PR / WIP diff on two axes — Standards and Spec                            |
| `handoff`                       | Writing the context dump when passing work to someone else (or to a fresh session)             |
| `diagnosing-bugs`               | A hard bug or perf regression — hypothesis loop rather than guess-and-patch                    |
| `research`                      | Investigating a question against primary sources → a Markdown file in `docs/research/`         |
| `prototype`                     | A throwaway spike to answer a design question                                                  |
| `codebase-design`               | Designing or improving a module's interface; the deep-module vocabulary                        |
| `domain-modeling`               | Pinning domain terminology or recording an ADR (usually reached via `grill-with-docs`)         |
| `triage`                        | Sorting incoming issues into the labels in `docs/agents/triage-labels.md`                      |
| `wayfinder`                     | Navigating a large, foggy piece of work via a map ticket + child tickets                       |
| `resolving-merge-conflicts`     | An in-progress merge/rebase conflict                                                           |
| `improve-codebase-architecture` | Scanning for deepening opportunities → an HTML report (invoke explicitly)                      |
| `writing-for-agents`            | Authoring a new skill or rule, or editing this file                                            |
| `ask-matt` / `teach`            | Asking which skill fits the situation, or a taught walkthrough of a concept                    |
| `wizard`                        | Generating a bash wizard for steps only a human can do (a dashboard, a credential)             |
| `setup-matt-pocock-skills`      | Re-scaffolding `docs/agents/*` — already run; only needed to switch trackers                   |
| `tdd`                           | Red-green-refactor on Vitest + RTL — read the `testing-*` rules first (§7a)                    |
| `vercel-react-best-practices`   | Re-renders, data fetching, bundle, async perf                                                  |
| `web-design-guidelines`         | Visual polish, hierarchy, spacing, accessibility                                               |
| `gitnexus-*` (six)              | Exploring architecture, impact analysis before an edit, debugging, safe refactors, the CLI     |

> Vercel renamed `react-best-practices` upstream; the installed directory is
> **`vercel-react-best-practices`**. The content is the same guide the reference monorepo carries
> under the old name.

## §7a · Workflow Skills — Repo Overrides

- **Ngôn ngữ:** LUÔN trao đổi với user bằng tiếng Việt — kể cả khi đang chạy skill
  (grill, implement, code-review, …): câu hỏi phỏng vấn, báo cáo review, giải thích
  đều bằng tiếng Việt. Giữ nguyên thuật ngữ kỹ thuật tiếng Anh (Runtime, Flavor, Gate,
  query key, seam, tracer bullet, …), không dịch.
- **Artifacts** sinh ra bởi các workflow skill (spec, ticket, `CONTEXT.md`, ADR, plan):
  viết bằng tiếng Việt, thuật ngữ kỹ thuật giữ tiếng Anh.
- **Code, tên biến, commit message, và `.agents/rules/*`:** giữ tiếng Anh. Rule cố ý
  viết tiếng Anh để còn diff được với bản upstream ở reference monorepo.
- **Skill bổ trợ khi viết code:** trong lúc chạy `/implement` (hoặc `prototype`) — trước
  khi viết/sửa React component hay hook, LOAD skill `vercel-react-best-practices`; khi đụng
  UI/layout/accessibility, load thêm `web-design-guidelines`. Nếu khuyến nghị của skill
  mâu thuẫn với `.agents/rules/` thì **rules của repo thắng**. Lưu ý riêng: skill của
  Vercel viết cho Next.js, nên phần server components / RSC **chỉ** áp dụng cho app
  Runtime Next; với app Runtime Vite (SPA thuần) thì bỏ qua.

### Runtime nào — hỏi trước khi viết dòng đầu tiên

Repo có **hai Runtime**, và gần như mọi rule đều gắn với đúng một trong hai. Trước khi
sửa code trong `apps/`, xác định app đang làm chạy Runtime nào (nhìn `package.json`:
có `next` → Next Runtime; có `vite` + `react-router` → Vite Runtime), rồi đọc đúng
cluster: `next-*` cho Next, `routing-*` cho Vite. Đừng bê pattern từ app này sang app
kia — hai hình dạng cố ý khác nhau, không phải drift cần "đồng bộ".

### TDD — có test runner, dùng bình thường

Repo **có** test runner: **Vitest 5 + React Testing Library** (jsdom) cho unit/component,
**Playwright 1.62** cho E2E. `/tdd` và nhánh TDD trong `/implement` chạy bình thường.
Đọc `.agents/rules/testing-*.md` trước khi viết test. Hai quy ước dưới đây **không**
nằm trong cluster đó mà ở chính đây, nên đọc kèm: test nằm trong cây
**`apps/<app>/test/`**, soi gương đường dẫn dưới `src/`; và mock đặt ở **service
singleton** trong `~/libs/http-client`, tuyệt đối không mock `axios` hay query hook.

Vòng verify khi làm việc:

- Trong lúc code: `bun run typecheck`, và `bun run --filter @monorepo/<app> test:watch`
  trên đúng một file.
- Trước khi xong: `bun run check && bun run typecheck && bun run test && bun run build`
  — đúng bốn job chặn merge trong `.github/workflows/ci.yml`.
- **Không** thêm tiền tố `TZ=UTC` vào lệnh nào: pin nằm trong `vitest.config.ts` vì cú
  pháp đó không hợp lệ trên PowerShell.
- E2E (`bun run e2e`) **không** nằm trong vòng TDD và không chặn merge
  (`continue-on-error: true`), nhưng job GitHub Actions **tự chạy** khi diff chạm
  `apps/`/`packages/`/`tooling/`. Chạy local khi đụng tới route, guard, `proxy.ts`, hoặc
  đường boot. Trên Windows chạy `bunx playwright test` với cwd là thư mục app — gọi qua
  `bun run` script có thể treo lúc launch Chromium.

Coverage được **đo chứ không gật**: `bun run test:coverage` có báo cáo, nhưng không có
ngưỡng nào làm fail CI.

### Nguồn Standards cho `/code-review`

Trục **Standards** đối chiếu diff với `.agents/rules/` (index:
[`.agents/README.md`](.agents/README.md), registry: `.agents/rules/_sections.md`) — đây là
"documented coding standards" của repo, thay cho `CODING_STANDARDS.md` / `CONTRIBUTING.md`
mà skill mặc định tìm. Ưu tiên rule có impact **CRITICAL** và **HIGH**; rule của repo luôn
thắng smell baseline khi hai bên xung đột. Bỏ qua mọi thứ Biome đã tự enforce (format,
import sorting, `noProcessEnv`, …). Nhớ đọc rule **đúng Runtime** của diff đang review.

### Spec / ticket

Nằm trong **`.agents/plans/<topic>/`** dưới dạng markdown (`spec.md` + `NN-*.md`), không
dùng GitLab, không dùng GitHub Issues, không dùng `glab`/`gh` — xem §7b và §9.

## §7b · Plans (`.agents/plans/`) — đây là tracker

`.agents/settings.json` sets `"plansDirectory": ".agents/plans"`, so Claude Code's own plan-mode output lands there — but in this repo the directory is more than a scratch space: **it is the issue tracker** (decision 17). One folder per topic, holding a `spec.md` and numbered ticket files `NN-<slug>.md`, each with a `status` in its front-matter. The value set is closed and lives in [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md): the five triage roles plus `in-progress` and `done`. There is no external service to sync with, and no `glab`/`gh`.

New work starts here: `/to-spec` writes the `spec.md`, `/to-tickets` splits it into `NN-*.md`, `/implement` picks one up and updates its `status`. A ticket that is finished stays in place as history — where a finished ticket and a rule disagree, **the rule wins**.

> **Architecture and design docs go to `docs/`**, not here — ADRs in `docs/adr/`, research in `docs/research/`. Glossary terms go to `CONTEXT.md` (root) or a workspace's own `CONTEXT.md`, listed in `CONTEXT-MAP.md`.

---

## §8 · Authoring New Material

- **New rule** — copy `.agents/rules/_template.md` (front-matter `title` / `impact` / `impactDescription` / `tags`; body with `❌`/`✅` Incorrect/Correct blocks). File name = `kebab-case-topic.md` matching an existing cluster prefix (register a new prefix in `.agents/rules/_sections.md` first). Keep it concise (~40–110 lines), write it in **English**, ground every example in code that actually exists in this repo, and state the Runtime it applies to when it applies to only one. Then add a row to the index in `.agents/README.md`.
- **New ADR** — `docs/adr/NNNN-<slug>.md`, Vietnamese, with `status` + `date` front-matter, Considered Options and Consequences. Link it from the rule or the `CONTEXT.md` term it settles.
- **New skill** — copy an existing `.agents/skills/<name>/SKILL.md` for shape, and load `writing-for-agents` first. A skill written here is **yours**: it gets no entry in `skills-lock.json`, and `npx skills@latest update` neither touches nor restores it. Never hand-edit a vendored skill instead — that drifts its hash and breaks `skills experimental_install`; re-sync it from upstream, or fork it under a new name.

When adding cross-cutting content (e.g. a new workspace package, or a Flavor of an existing one), also update:

1. **§1 Project Structure** above — add the folder, and mark it `**Flavor**` if it splits by Runtime.
2. **§3 "Where do I put X?"** — add a lookup row, splitting it per Runtime only where the two genuinely differ.
3. **§4 When to Read What** — add a task row if a new rule appears.
4. `.agents/rules/architecture-vertical-slices.md` / `architecture-feature-boundaries.md` — the placement guidance.
5. `.agents/README.md` — add or adjust the rule's index row; register new prefixes in `.agents/rules/_sections.md`.
6. `CONTEXT.md` — if the change introduces a word the team will now use in conversation.

---

## §9 · Agent docs

### Issue tracker

Markdown in **`.agents/plans/<topic>/`**: a `spec.md` plus numbered `NN-*.md` tickets carrying a `status` in their front-matter (decision 17). No GitLab, no GitHub Issues, no CLI. [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) writes this layout up for the workflow skills that look for a tracker config: the frontmatter, the `**Blocked by:**` edge, and what "publish to the tracker", "fetch the ticket" and "comment on an issue" each mean when the tracker is a directory.

### Triage labels

The label vocabulary the `triage` skill sorts into — the label string equals the role name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Applied as the `status` field of a ticket rather than a service-side label, so there is nothing to create before it can be used. [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md) carries the mapping, plus the one value the five roles cannot express (`done`) and what `ready-for-human` is reserved for.

### Domain docs

Multi-context: the root [`CONTEXT-MAP.md`](./CONTEXT-MAP.md) points at [`CONTEXT.md`](./CONTEXT.md) and, as each is needed, at per-workspace `CONTEXT.md` files. System-wide decisions are ADRs in [`docs/adr/`](./docs/adr/). [`docs/agents/domain.md`](./docs/agents/domain.md) tells the `domain-modeling` skill where to read and write — including that `legacy/` is deliberately outside the map and must not be mined for vocabulary.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **monorepo** (4205 symbols, 8436 relationships, 216 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact analysis before editing.** Use `impact({target: "symbolName", direction: "upstream"})` (MCP) or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .` (CLI fallback); report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/monorepo/context` | Codebase overview, check index freshness |
| `gitnexus://repo/monorepo/clusters` | All functional areas |
| `gitnexus://repo/monorepo/processes` | All execution flows |
| `gitnexus://repo/monorepo/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
