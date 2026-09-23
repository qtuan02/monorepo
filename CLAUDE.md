# Personal Monorepo — Agent Guide

> The short guide: what every task needs. The long form is in [`.agents/`](.agents/README.md) — before touching
> code, find your task in **§5 · Đọc gì khi nào** and read what that row names.
>
> Two terms decide almost every question here, defined in [`CONTEXT.md`](./CONTEXT.md): a **Runtime** (how an app
> executes — Vite client SPA · Next.js App Router · React Router framework mode) and a **Flavor** (the
> Runtime-specific half of a shared package, on its own subpath). Get the Runtime right first; the Flavor, the
> Template app to clone and the rule cluster to read all follow from it.
>
> `AGENTS.md` is a **symlink to this file**; `.claude` is a symlink to `.agents`. Both are git mode `120000` —
> `.agents/knowledge-base.md` § AI tooling says how to clone them on Windows.
>
> The **GitNexus — Code Intelligence** block at the bottom, between the `gitnexus:start` / `gitnexus:end` markers, is
> rewritten by `npx gitnexus analyze`. Edit the guide freely; never hand-edit inside those markers.

---

## §1 · Map (Turborepo + Bun workspaces)

Full tree, folder by folder, with what each app deliberately does **not** have → [`.agents/project-structure.md`](.agents/project-structure.md).
Each app's current shape → its own `apps/<app>/README.md`.

```text
apps/
├── _template_vite/          Template, Runtime Vite         — SPA behind a login, nginx.           dev 3000 / E2E 3100
├── _template_next/          Template, Runtime Next         — App Router, SSR/SEO, standalone.     dev 3001 / E2E 3101
├── _template_reactrouter/   Template, Runtime React Router — framework mode, react-router-serve.  dev 3005 / E2E 3105
├── portfolio/               Next  — the CV site, "Terminal / neubrutalist" (ADR-0008).                dev 3002 / E2E 3102
├── documents/               Vite  — docs site for the two published packages, "Prism" (ADR-0009).     dev 3003 / E2E 3103
├── mcp/                     Next  — MCP server over OpenWeatherMap, POST /api/mcp, no auth.           dev 3004 / E2E 3104
├── smart-rental/            Vite  — landlord Portal, "Hôm nay" (ADR-0011/0012/0013/0015), Vercel.     dev 3006 / E2E 3106
├── chat/                    Vite  — Messenger-style over chat-socket, "Islands" (ADR-0014/0016).       dev 3007 / E2E 3107
└── storybook/               previews @monorepo/ui — port 6006, no ports.env, no E2E
packages/                    all private, source-only, subpath-only `exports` into src/ — no build step between an app and a package
├── api · types · hook · dayjs      dayjs is the ONE package with a root entry (its root is the singleton); hook is Derived from hooks-ts (ADR-0010)
├── env · i18n · sentry   [Flavor]  Runtime-specific halves under vite/ · next/ · react-router/ (sentry: Next only)
├── ui                              63 shadcn base-vega primitives on Base UI; #components/* subpath imports inside the package only
└── ui-public · hook-public         the two Publish shells (@fe-monorepo/ui, @fe-monorepo/hook) — the only workspaces Changesets versions (ADR-0004)
tooling/tailwind · tooling/typescript   the one theme (theme.css) and the tsconfig presets
turbo/generators/            gen:app (prompts for the Runtime, clones the Template) · gen:package · gen:tooling
.agents/  (= .claude)        rules/ (52 rules, 12 clusters) · skills/ (38 vendored) · commands.md · knowledge-base.md · project-structure.md · workflow.md · plans/ (frozen)
docs/                        adr/ · design/ (briefs + committed HTML mockups) · agents/ (tracker, labels, domain) · guides/ · research/
CONTEXT.md · CONTEXT-MAP.md  the glossary and the map of per-workspace glossaries
.env.example                 the ONE env template — both prefix groups; copy to .env at the root
biome.json · turbo.json · package.json (Bun catalogs) · skills-lock.json · .mcp.json · .changeset/ · .github/workflows/{ci,release}.yml
```

Each app's two ports live in its own `ports.env` — the one place they are stated; `gen:app` assigns the next free pair.

---

## §2 · Data Flow (one direction only, in all three Runtimes)

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

**React Router Runtime** (`_template_reactrouter` and its clones) — the same graph again, with `src/routes/**` over `src/routes.ts` as the top layer and the same second path into it:

```text
.env (repo root, via Vite envDir + dotenv-cli) → import.meta.env / process.env → ~/env.ts → @monorepo/api → ~/libs/http-client.ts
     ├── src/routes/<route>.tsx `loader` / `action`  (server-rendered — what the first HTML and `meta` are built from)
     └── ~/hooks/api/<domain>.ts                     (TanStack Query — everything after paint)
            → ~/features/<feat>/{components,templates} → src/routes/<route>.tsx
```

> The **Env** note (one root `.env`, both prefix groups, a key named for the app that owns it, schema and `createEnv`
> in one `env.ts`) and the **Flavor** note live in [`.agents/project-structure.md` § Data flow notes](.agents/project-structure.md);
> the gotchas in [`.agents/knowledge-base.md`](.agents/knowledge-base.md).

---

## §3 · "Where do I put X?" Quick Lookup

| I want to add…                                | Put it in…                                                                                                                                                                          | Rule                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| A whole new app — **which Template?**         | `bun run gen:app` and pick the Runtime; never hand-copy a Template. Needs a public, crawlable page **and** wants the App Router, RSC, `"use cache"`, Server Actions → `next`. Needs the same server-rendered first HTML but one Vite build, route-module `loader`s and `react-router-serve` → `reactrouter`. Internal, behind a login, no crawler → `vite`. `gen:app` writes the next free port pair into the clone's `ports.env`; confirm by starting it beside its Template (not with `bun run e2e` — Playwright reuses a server already on the port, so a collision passes). | `next-app-router-structure.md`, `reactrouter-route-modules.md`, `routing-constants.md` |
| A backend endpoint (HTTP)                     | `packages/api/src/<system>/<domain>-service.ts` (folder = backend system, file = domain; class `<System><Domain>Service`) → instantiate in `~/libs/http-client.ts` → wrap in `~/hooks/api/<domain>.ts`                                              | `architecture-features-modules.md`, `tanstack-key-factory.md`            |
| A shadcn primitive                            | `packages/ui/src/components/` via `bun run --filter @monorepo/ui ui-add` — never hand-copied into an app                                                                             | `architecture-ui-primitives.md`                                          |
| A generic React hook (debounce, media query…) | `packages/hook/src/use-<name>.ts`. If [hooks-ts](https://github.com/michal-worwag/hooks-ts) has it, copy it in as **Derived** (source header + `LICENSE-hooks-ts`, patched only where a repo rule or SSR forces it); write it as **Own** only when no upstream hook covers it. Never `packages/ui/src/hooks/` — that directory must not exist (`guard:no-local-hooks` fails `ui-add` if the CLI scaffolds one; `commands.md` § UI primitives) | ADR-0010, `architecture-feature-boundaries.md`, `quality-imports.md`               |
| A change to what `ui` / `hook` **publish**    | Code goes in `packages/{ui,hook}/src/` as usual. The *published surface* is the shell: edit `packages/<name>-public/package.json` (`exports`, literal dependency ranges, peers) and its consumer README, then `bun run changeset` so the version bump and CHANGELOG come from one place. Never hand-edit a shell's `dist/` (gitignored build output) or its `version` (Changesets owns it) | ADR-0004                                                                 |
| A translation string                          | `packages/i18n/src/locales/<code>.json`, in **ICU MessageFormat** — `{name}`, never `{{name}}`; one `{count, plural, …}` message, never a `_one`/`_other` key pair; and **no rich-text tag** (`<b>`, `<link>`), the one construct the two Flavors cannot agree on. `catalogue-invariants.test.ts` enforces all three | ADR-0002, `next-i18n-next-intl.md` (Next), `reactrouter-i18n-env.md` (React Router), `.agents/knowledge-base.md` § Internationalization |
| A new language                                | `packages/i18n/src/languages.ts` + `packages/i18n/src/locales/<code>.json`. Nothing in `apps/` changes; the typed `messages` map fails to compile until the JSON exists              | ADR-0002, `.agents/knowledge-base.md` § Internationalization              |
| A date/time display format                    | `packages/dayjs/src/formats.ts` — never an inline format string at a call site                                                                                                       | `dates-dayjs-singleton.md`                                               |
| A dayjs plugin, or a dayjs locale             | `packages/dayjs/src/dayjs.ts` (`dayjs.extend(...)` / `import "dayjs/locale/<code>"`), plus `src/locales.ts` for a locale. Never extend from an app                                    | `dates-dayjs-singleton.md`                                               |
| A feature screen (any Runtime)                | `apps/<app>/src/features/<feat>/{components,templates,hooks}` — templates are `<name>.template.tsx`, default-exported                                                                | `architecture-vertical-slices.md`, `architecture-shared-components.md`   |
| A new route (**Vite** app)                    | `~/constants/routes.ts` + the tree in `~/pages/main.tsx` + a thin `~/pages/<feat>-page.tsx`                                                                                          | `routing-constants.md`, `routing-route-guards.md`                        |
| A new route (**Next** app)                    | A folder under `src/app/[locale]/` with a thin `page.tsx` that renders the slice's template and adds `generateMetadata`. Add the unprefixed path to `~/constants/routes.ts` and navigate with next-intl's `Link` — never a literal `/vi/...` | `next-app-router-structure.md`, `next-i18n-next-intl.md`                 |
| A new route (**React Router** app)            | An `index()` / `route()` / `layout()` entry in `src/routes.ts`, plus a thin module in `src/routes/<name>.tsx` exporting `loader` / `meta` / `action` as it needs them and a default export that renders the slice's template. There is no `~/constants/routes.ts`: every link, redirect and form action goes through the typed `href()` that `react-router typegen` builds from that table | `reactrouter-route-modules.md`, `reactrouter-typed-href.md`              |
| A route guard / auth gate (**Vite** app)      | `~/features/auth/provider/<name>-route.tsx` (default export, no props) + wrap the route group in `~/pages/main.tsx`                                                                   | `routing-route-guards.md`                                                |
| A route guard / auth gate (**Next** app)      | A **pure function** in `~/features/auth/guard/`, called from `src/proxy.ts` over the `HttpOnly` session cookie. Never a component that decides while rendering — the server has already sent the bytes by then | `next-proxy-guards.md`                                                   |
| A route guard / auth gate (**React Router** app) | A `MiddlewareFunction<Response>` in `~/features/auth/middleware/` (`require-session.ts`, `guest-only.ts`), mounted as the `middleware` export of the pathless `layout("routes/protected.tsx", […])` that wraps the guarded group in `src/routes.ts`. That route module must also export a `loader`, or the guard stops running on client navigations | `reactrouter-middleware-guards.md`                                       |
| Data for a screen (**Next** app)              | A crawler needs it in the first HTML → `~/features/<feat>/server/*.ts` with `"use cache"` + `cacheTag`/`cacheLife`. Interaction after paint → `~/hooks/api` + TanStack Query. Both use the same service singleton; one value never lives in both | `next-data-fetching.md`                                                  |
| Data for a screen (**React Router** app)      | A crawler needs it, or `meta` is built from it → the route module's own `loader`. Interaction after paint → `~/hooks/api` + TanStack Query. Same singleton, one home per value, no `dehydrate` / `<HydrationBoundary>` | `reactrouter-loader-vs-query.md`                                         |
| Code that must never reach the browser (**React Router** app) | `~/libs/<name>.server.ts`. The `.server.ts` suffix is the only thing the build checks — drop it and the module compiles into the client graph silently. Import it only from a route module's `loader` / `action` / `middleware` or a slice's `middleware/`, never from a component. Everything else under `src/` is compiled into **both** graphs, so no other `~/libs` module may touch `window` at module scope | `reactrouter-server-modules.md`                                          |
| A Zustand store                               | `~/stores/use-<name>-store.ts` (app-wide) or a slice's `stores/`. A **Next** or **React Router** app has neither: its session is an `HttpOnly` cookie, and a persisted token store would undo that | `zustand-global.md`, `zustand-feature.md`, `next-proxy-guards.md`, `reactrouter-middleware-guards.md` |
| A form schema                                 | `~/features/<feat>/types/<form>-form.ts` (Zod + `z.infer`), with `import * as z from "zod"`                                                                                          | `forms-schema-driven.md`, `forms-field-components.md`                    |
| A **type** — which of the two homes?          | Backend owns the shape (entity, endpoint params, response payload) → `packages/types/src/<domain>.ts`, because `@monorepo/api` must import it and a package cannot reach into an app. Only this app knows it → `apps/<app>/src/types/` or the slice's `types/` | `architecture-features-modules.md`                                       |
| An env variable                               | Two edits: add it with a dev value to the root `.env.example` under the right prefix group, then extend the schema in that app's `src/env.ts` — `baseEnvSchema.extend()` (Vite); a `server`/`client` entry plus a literal `clientRuntimeEnv` read (Next); a `server`/`client` entry plus a line in the **full** `runtimeEnv` map (React Router — a client key is a literal `import.meta.env.PUBLIC_*` read, a server key is guarded with `typeof process === "undefined"`). **Name it for who owns it**: a value every app reads keeps the plain key (`PUBLIC_BASE_DOMAIN_API`, `NEXT_PUBLIC_APP_ENV`); a value one app reads carries that app's name — `NEXT_PUBLIC_<APP>_…` (Next), `PUBLIC_<APP>_…` (Vite / React Router client), `<APP>_…` (server secret) — and the Templates are apps too (`TEMPLATE_VITE` / `TEMPLATE_NEXT` / `TEMPLATE_REACTROUTER`). One root `.env` serves every app, so two apps reusing a key build with each other's value. Examples: `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN`, `PUBLIC_DOCUMENTS_STORYBOOK_URL`, `MCP_OPENWEATHERMAP_API_KEY`, `TEMPLATE_REACTROUTER_SESSION_SECRET` | ADR-0003, ADR-0006, `next-env-t3.md`, `reactrouter-i18n-env.md`, `packages/env/README.md` |
| A Tailwind class string                       | Inline in the `className` at the call site — never lifted into `~/constants/*.ts`. The one exception is a layout measurement several sibling files must agree on, kept as close to those files as possible | `quality-styling-tailwind.md`                                            |
| An image the UI renders (icon, illustration)  | `apps/<app>/src/assets/<group>/<name>.<ext>`, reached with an **import**. A `public/` URL string in JSX is checked by nothing; `public/` keeps only what must be fetched by a fixed, unhashed name | `quality-imports.md` § Static assets                                     |
| Cross-feature shared code                     | Promote `~/features/<feat>/…` → `~/{components,hooks,utils}`; if used in 2+ apps → `@monorepo/*`, and if it depends on the Runtime, as a **Flavor** subpath rather than a second package | `architecture-feature-boundaries.md`, `architecture-shared-components.md` |
| A unit / component test                       | `apps/<app>/test/<same path as under src>/<source>.test.ts(x)` — the `test/` tree mirrors `src/`; nothing under `src/` is a test                                                     | `testing-coverage.md`                                                    |
| An E2E flow                                   | `apps/<app>/e2e/<flow>.e2e.ts` (Playwright; the `.e2e.ts` suffix keeps it out of Vitest)                                                                                             | `testing-playwright.md`                                                  |
| An architectural decision worth recording     | `docs/adr/NNNN-<slug>.md` (Vietnamese, `status` + `date` front-matter). A glossary term goes in `CONTEXT.md`; a per-workspace term in that workspace's own `CONTEXT.md`, registered in `CONTEXT-MAP.md` | `workflow.md` §3, §4                                                                   |

### Path Aliases

- `~/*` → `./src/*` — a tsconfig `paths` alias declared per app in `apps/<app>/tsconfig.json`; identical in all three Runtimes (a React Router app picks it up through `resolve.tsconfigPaths` in `vite.config.ts`).
- `./+types/<route>` → the per-route types `react-router typegen` generates — **React Router Runtime** only, inside a route module (`src/routes/*`, `src/root.tsx`). Not a `paths` alias: `tsconfig.json` merges the generated tree in with `rootDirs: [".", "./.react-router/types"]`, so it resolves only after typegen has run — which is why that app's `typecheck` script runs typegen first, and its `turbo.json` lists `.react-router/**` in `typecheck.outputs`.
- `@monorepo/<name>` → a workspace package, resolved by Bun workspaces + the package's `exports` field (not a tsconfig path). Every package is subpath-only — `@monorepo/ui/components/button`, `@monorepo/api/client`, `@monorepo/env/next/create-env` — except `@monorepo/dayjs`, whose root entry is the configured singleton.
- `#components/*` · `#utils/cn` · `#hooks/*` — Node subpath imports declared in `packages/ui/package.json`, used **only inside `packages/ui/src`** so a `shadcn add --overwrite` writes files byte-identical to upstream. The `ui` build rewrites them away before the output reaches `ui-public/dist` (ADR-0004).
- `@fe-monorepo/<name>` is the **npm** name of a Publish shell, not an alias: `@fe-monorepo/ui` is what a consumer installs, `@monorepo/ui` is what this repo imports. Never write `@fe-monorepo/*` in an app or a package here.
- Never `@/*`, and never a deep relative chain (`../../components`) inside `src/`.

### Tech Stack

Shared by all three Runtimes: React 19 (no `forwardRef`; **React Compiler on in all three Templates**) · TanStack Query v5 · Zod v4 + React Hook Form v7 · Tailwind v4 (`@monorepo/tailwind-config`, no per-app config) · shadcn `base-vega` on Base UI (`@monorepo/ui`) · lucide-react · dayjs (`@monorepo/dayjs`) · axios via `HttpClient` (`@monorepo/api`) · TypeScript 7 strict · Biome 2 (formatter + linter + import sorting, one root config) · Vitest 5 + RTL · Playwright 1.62 · **Bun + Turbo**.

- **Vite Runtime:** Vite 8 + `@vitejs/plugin-react` 6 + `@rolldown/plugin-babel` · React Router **8 declarative** — one package: components and hooks from `react-router`, the DOM entry points (`RouterProvider`, `HydratedRouter`) from `react-router/dom`; `react-router-dom` no longer exists · Zustand v5 · i18next Flavor · nginx runner.
- **Next Runtime:** Next 16 App Router (`cacheComponents`, `reactCompiler`, Turbopack, `proxy.ts`, `output: "standalone"`) · next-intl Flavor · t3-env Flavor · `@monorepo/sentry` · `node:24-alpine` runner.
- **React Router Runtime:** React Router **8 framework mode** — one Vite build producing `build/client` + `build/server`, served by `react-router-serve`; the config-based route table `src/routes.ts`; `react-router typegen` → typed `href()` and `./+types/<route>`; `appDirectory: "src"`; `prerender: ["/about"]`; route `middleware` guards over a signed `HttpOnly` cookie session · i18next Flavor (one `cloneInstance` per request) · the `react-router` env Flavor (`@t3-oss/env-core`) · no `@monorepo/sentry` · `node:24-alpine` runner.

---

## §4 · Quy ước bắt buộc (luôn áp dụng)

Bản dài — bước design, vòng TDD, nguồn Standards cho `/code-review`, tracker, cách viết rule/ADR/skill — ở
[`.agents/workflow.md`](.agents/workflow.md). Sáu điều dưới đây không được bỏ qua ở bất kỳ turn nào:

- **Ngôn ngữ:** LUÔN trao đổi với user bằng tiếng Việt — kể cả khi đang chạy skill (grill, implement, code-review, …).
  Giữ nguyên thuật ngữ kỹ thuật tiếng Anh (Runtime, Flavor, Gate, query key, seam, …). Artifact của workflow skill
  (spec, ticket, `CONTEXT.md`, ADR, plan) viết tiếng Việt; **code, tên biến, commit message và `.agents/rules/*`
  giữ tiếng Anh** (rule cố ý tiếng Anh để còn diff với upstream).
- **Runtime nào — xác định trước khi viết dòng đầu tiên.** Nhìn `package.json` của app: có `next` → Next; có
  `@react-router/dev` + `react-router.config.ts` → React Router; có `vite` + `react-router` mà **không** có
  `@react-router/dev` → Vite (thứ tự này quan trọng). Rồi đọc đúng cluster: `next-*` / `reactrouter-*` / `routing-*`.
  Ba hình dạng cố ý khác nhau — đừng bê pattern từ app này sang app kia, đó không phải drift cần "đồng bộ".
- **Skill bổ trợ khi viết code:** trước khi viết/sửa React component hay hook, load `vercel-react-best-practices`;
  đụng UI/layout/accessibility, load thêm `web-design-guidelines`. Mâu thuẫn thì **rules của repo thắng**; phần
  RSC/server components của skill Vercel chỉ áp dụng cho app Runtime Next.
- **Gate = đúng bốn lệnh** `bun run check && bun run typecheck && bun run test && bun run build` — chính là bốn job
  chặn merge trong `ci.yml`. Test nằm ở `apps/<app>/test/`, soi gương `src/`; mock đặt ở **service singleton trong
  `~/libs/http-client`**, không mock `axios` hay query hook. **Không** thêm tiền tố `TZ=UTC` (pin đã ở
  `vitest.config.ts`; cú pháp đó hỏng trên PowerShell). E2E (`bun run e2e`) **chỉ chạy local**, CI không có job E2E;
  trên Windows chạy `bunx playwright test` với cwd là thư mục app.
- **Tracker = GitHub Issues** của `qtuan02/monorepo` qua `gh`: issue nhãn `spec` + ticket là sub-issue, **số issue là
  danh tính ticket** (`/implement 42` = `#42`). Repo public — body issue là world-readable. `.agents/plans/` đã đóng
  băng, chỉ đọc. Bản dài: [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).
- **Bước design** (`ui-ux-pro-max`) đọc CSV tĩnh bằng `Grep`/`Read` — **không chạy `scripts/search.py`**, không cài
  Python. Brief ở `docs/design/<app>-<round>.md`, mockup HTML commit cạnh nó.

---

## §5 · Đọc gì khi nào

| Task                                       | Read first                                                                             | Then                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Start any non-trivial task**             | `.agents/project-structure.md` (the app you are in) + `§3 · "Where do I put X?"` + `architecture-vertical-slices.md` + `architecture-circular-dependencies.md` | the matching rule(s) below                                                                              |
| **Add a file of any kind** (route, endpoint, store, env key, type, test, primitive…) | `§3 · "Where do I put X?"` above — the row for that kind names the rule | that rule |
| **Run a workflow skill** (`/research` → design → `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review` → `/handoff`), **or author a rule / ADR / skill** | [`.agents/workflow.md`](.agents/workflow.md) | `docs/guides/skills-workflow.md` (the human walkthrough) |
| **Work in a Next app**                     | `next-app-router-structure.md` + `next-server-vs-client-components.md`                  | `next-data-fetching.md`, `next-proxy-guards.md`, `next-i18n-next-intl.md`, `next-env-t3.md`             |
| **Work in a Vite app**                     | `routing-constants.md` + `routing-route-guards.md`                                      | `architecture-vertical-slices.md`, `zustand-global.md`                                                   |
| **Work in a React Router framework app**   | `reactrouter-route-modules.md` + `reactrouter-typed-href.md`                             | `reactrouter-loader-vs-query.md`, `reactrouter-middleware-guards.md`, `reactrouter-server-modules.md`, `reactrouter-i18n-env.md` |
| **Add / change a backend HTTP call**       | `architecture-features-modules.md`                                                      | `tanstack-key-factory.md`, `tanstack-use-query.md` / `…-use-mutation.md` / `…-use-infinite.md`           |
| **Read server state in a component**       | `tanstack-consume-query.md`                                                             | `patterns-self-fetching-components.md`, `patterns-loading-skeletons.md`, `patterns-parallel-fetching.md` |
| **Submit / mutate data**                   | `tanstack-consume-mutation.md`                                                          | `tanstack-use-mutation.md`, `forms-schema-driven.md`                                                     |
| **Decide server read vs TanStack Query**   | `next-data-fetching.md` (Next) / `reactrouter-loader-vs-query.md` (React Router)         | `next-server-vs-client-components.md`, `reactrouter-server-modules.md`, `testing-playwright.md` (the raw-HTML assertion that proves it) |
| **Add / change a UI primitive**            | `architecture-ui-primitives.md`                                                         | `quality-styling-tailwind.md`                                                                            |
| **Add / change a feature screen**          | `architecture-vertical-slices.md`                                                       | `architecture-feature-boundaries.md`; then the Runtime's routing rule (`routing-*`, `next-*` or `reactrouter-*`) |
| **Add / change a form**                    | `forms-schema-driven.md`                                                                | `forms-field-components.md`, `forms-use-watch.md`                                                        |
| **Add / change a Zustand store**           | `zustand-global.md` / `zustand-feature.md`                                              | `tanstack-consume-query.md` (server data stays in Query, not a store)                                    |
| **Add a translation or a language**        | ADR-0002 + `packages/i18n/src/languages.ts`                                             | `next-i18n-next-intl.md` (Next), `reactrouter-i18n-env.md` (React Router — the per-request clone, and `getFixedT` in `meta`), `dates-locale-render-input.md` (anything locale-sensitive on screen) |
| **Touch env / add a variable**             | ADR-0003 + ADR-0006 + `packages/env/README.md`                                          | `next-env-t3.md` (Next), `reactrouter-i18n-env.md` (React Router), `.agents/project-structure.md` § Data flow notes (Vite)                    |
| **Design the API surface of a component**  | `react-no-forwardref.md`, `react-no-inline-components.md`                               | `quality-list-keys.md`, `react-effects-sync-only.md`                                                     |
| **Write or fix a test**                    | `testing-coverage.md`                                                                   | `testing-playwright.md` for anything needing a real browser or a real server                             |

> Not covered above: scan `.agents/rules/` filenames (kebab-case topical, 12 prefix clusters — index in
> [`.agents/README.md`](.agents/README.md)) and skim the 2–3 likeliest. Facts no single file shows →
> [`.agents/knowledge-base.md`](.agents/knowledge-base.md).

---

## §6 · Commands

Run from the repo root. The full reference, with the constraint attached to each → [`.agents/commands.md`](.agents/commands.md).

```bash
bun install
bun run dev:<app>                # template-vite · template-next · template-reactrouter · portfolio · documents · mcp · smart-rental · chat · storybook
bun run check | check:fix        # Biome, whole repo, one pass
bun run typecheck | test | build # with `check`: the Gate — the same four jobs ci.yml blocks on
bun run e2e                      # Playwright over every app with a playwright.config.ts — local only, not in CI
bun run --filter @monorepo/<app> test:watch
bun run gen:app                  # scaffold an app — never hand-copy a Template
bun run --filter @monorepo/ui ui-add
bun run changeset                # a release note for @fe-monorepo/ui or /hook; `release` is CI only
```

Pins: Node 24 · Bun 1.4.0 · Turbo 2.10 · Biome 2.5 · TypeScript 7. Dependency versions come from the Bun **catalogs**
in the root `package.json` — never hardcode one in a workspace `package.json`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **monorepo** (10560 symbols, 21183 relationships, 273 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/monorepo/context` | Codebase overview, check index freshness |
| `gitnexus://repo/monorepo/clusters` | All functional areas |
| `gitnexus://repo/monorepo/processes` | All execution flows |
| `gitnexus://repo/monorepo/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
