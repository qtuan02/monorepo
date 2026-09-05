# Personal Monorepo — Agent Documentation Index

- **[../CLAUDE.md](../CLAUDE.md)** — the main guide: project structure, the three Runtimes, the Flavor model, one-way data flow, where to put what, commands
- **[rules/](rules/)** — the engineering rules (source of truth); the section registry is [rules/\_sections.md](rules/_sections.md) and the scaffold for a new rule is [rules/\_template.md](rules/_template.md)
- **[skills/](skills/)** — scenario guides, most of them vendored as real files. The 25 from `mattpocock/skills` and `vercel-labs/agent-skills` are pinned by source + content hash in [../skills-lock.json](../skills-lock.json); re-sync those with the `skills` CLI rather than hand-editing one. The six `gitnexus-*` are vendored but **not** in the lock — `npx gitnexus analyze` rewrites them. One is **this repo's own** and belongs to nobody upstream: [skills/design-handoff/](skills/design-handoff/SKILL.md), the `chốt` step of the design phase — edit it directly, `npx skills update` never touches it. Its sibling `design` is bundled with Claude Code and is not a file here at all (see [../CLAUDE.md §7](../CLAUDE.md))
- **[commands.md](commands.md)** — the full command reference: setup, dev, the Gate, E2E, generators, CI, and the constraints on each
- **[knowledge-base.md](knowledge-base.md)** — project facts and gotchas that are not obvious from one file: the Flavor model, the env pipeline, the ICU catalogue invariants, the `ui-add` hooks alias, the Base UI orientation variants
- **[plans/](plans/)** — the **former** tracker (decision 17), frozen read-only when the repo moved to GitHub Issues: one folder per topic holding `spec.md` + `NN-*.md`, each with a `status` in its front-matter. Read it as history — a finished ticket records how it was verified. New work is an issue on `qtuan02/monorepo`; the conventions are written up in [../docs/agents/issue-tracker.md](../docs/agents/issue-tracker.md)
- **[settings.json](settings.json)** — Claude Code settings for this repo (`plansDirectory`)

Three things this index does **not** own, and where they live instead:
[`../docs/agents/`](../docs/agents/) holds the config the workflow skills read (tracker layout,
triage-label vocabulary, domain-doc rules); [`../.mcp.json`](../.mcp.json) registers Context7 and
GitNexus at project scope; and `../.claude` is a symlink to this directory, which is why there is
only one tree to maintain.

The rules are adapted from the reference monorepo for **this** stack, and they cover three
Runtimes. Shared by all three: React 19 (React Compiler on) · TanStack Query v5 · Zod v4 +
React Hook Form v7 · Tailwind v4 · shadcn `base-vega` on Base UI via `@monorepo/ui` ·
dayjs via `@monorepo/dayjs` · TypeScript 7 · Biome 2 · Bun + Turbo · Vitest 5.
**Vite Runtime** (`apps/_template_vite`): React Router 8 declarative, Zustand v5,
i18next Flavor of `@monorepo/i18n`, `vite` Flavor of `@monorepo/env`.
**Next Runtime** (`apps/_template_next`): Next 16 App Router with `cacheComponents`,
`proxy.ts`, next-intl Flavor, `next` (t3-env) Flavor, `@monorepo/sentry`.
**React Router Runtime** (`apps/_template_reactrouter`): React Router 8 **framework mode**,
served by `react-router-serve` over the built `build/server/index.js`, route middleware over
a signed session cookie, i18next Flavor of `@monorepo/i18n`, `react-router` Flavor of
`@monorepo/env`.

Rules are English so they stay diffable against the reference upstream; only `CLAUDE.md §7a`
and the Vietnamese docs (`CONTEXT.md`, ADRs, plans) are in Vietnamese.

## Rules Index

52 rules across 12 clusters, plus the two meta files.

### Architecture (6)

- [architecture-vertical-slices](rules/architecture-vertical-slices.md) — organize by domain under `~/features`; a slice is a complete vertical
- [architecture-circular-dependencies](rules/architecture-circular-dependencies.md) — imports point downward through the layers, in all three Runtimes
- [architecture-feature-boundaries](rules/architecture-feature-boundaries.md) — consume a slice through its public surface (`templates/`, `provider/`, `middleware`-shaped exports)
- [architecture-features-modules](rules/architecture-features-modules.md) — framework-agnostic `@monorepo/api` service classes vs `~/hooks/api` query hooks
- [architecture-ui-primitives](rules/architecture-ui-primitives.md) — use and extend the `@monorepo/ui` primitives (`render` prop, bare `data-open`, never `asChild`)
- [architecture-shared-components](rules/architecture-shared-components.md) — use and extend the shared composites in `~/components` (`exception/`, `page/`, `select/`)

### Routing — Vite Runtime (2)

`_template_vite` and its clones, on React Router 8 declarative. A Next or React Router framework-mode app follows its own cluster instead; the three shapes never coexist in one app.

- [routing-constants](rules/routing-constants.md) — every path comes from the `ROUTES` table in `~/constants/routes.ts`; imports from `react-router` / `react-router/dom`
- [routing-route-guards](rules/routing-route-guards.md) — auth/redirect guards at the route tree, in `~/features/auth/provider/` (`<ProtectedRoute>` / `<GuestRoute>`)

### React Router framework mode — React Router Runtime (6)

`_template_reactrouter` and its clones: React Router 8 framework mode, the route config in `src/routes.ts`, route middleware over a signed session cookie, served by `react-router-serve`.

- [reactrouter-route-modules](rules/reactrouter-route-modules.md) — the route config is data in `src/routes.ts`; a module under `src/routes/` stays thin over the slice's template
- [reactrouter-typed-href](rules/reactrouter-typed-href.md) — paths come from the typed `href()` typegen writes, not a `~/constants/routes.ts` table
- [reactrouter-middleware-guards](rules/reactrouter-middleware-guards.md) — access control as route middleware in a slice's `middleware/`, over a signed session cookie
- [reactrouter-loader-vs-query](rules/reactrouter-loader-vs-query.md) — a loader owns what the first HTML must carry, TanStack Query owns everything after paint
- [reactrouter-server-modules](rules/reactrouter-server-modules.md) — the `.server.ts` suffix keeps server-only code (`~/libs/session.server.ts`) out of the browser bundle
- [reactrouter-i18n-env](rules/reactrouter-i18n-env.md) — the i18next Flavor cloned per request, and the `react-router` Flavor of `@monorepo/env` with a `server` block beside `PUBLIC_`

### Next.js App Router — Next Runtime (6)

`_template_next` and its clones: Next 16, `cacheComponents: true`, `reactCompiler: true`, `proxy.ts` on the Node runtime.

- [next-app-router-structure](rules/next-app-router-structure.md) — `src/app/` is the path table plus framework wiring; the slice owns the screen
- [next-server-vs-client-components](rules/next-server-vs-client-components.md) — Server Component by default; `"use client"` is a deliberate, low boundary
- [next-data-fetching](rules/next-data-fetching.md) — cached server read (`"use cache"`) for what a crawler reads, TanStack Query for what a visitor does
- [next-proxy-guards](rules/next-proxy-guards.md) — access control in `proxy.ts`, decided by a pure function over an `HttpOnly` cookie; the redirect target is parsed, not pattern-matched
- [next-i18n-next-intl](rules/next-i18n-next-intl.md) — the locale is a URL segment; three wiring files; one shared ICU catalogue
- [next-env-t3](rules/next-env-t3.md) — the `next` Flavor of `@monorepo/env`: the `server`/`client` split, `NEXT_PUBLIC_`, literal `clientRuntimeEnv` reads, dotenv-cli

### React (3)

- [react-no-forwardref](rules/react-no-forwardref.md) — React 19: `ref` is a prop, drop `forwardRef`
- [react-no-inline-components](rules/react-no-inline-components.md) — never define a component inside another component
- [react-effects-sync-only](rules/react-effects-sync-only.md) — `useEffect` only syncs to external systems

### Code Quality (6)

- [quality-simplicity](rules/quality-simplicity.md) — clarity over cleverness
- [quality-imports](rules/quality-imports.md) — `~/` + `@monorepo/*`, named vs default exports, assets imported rather than `public/`-linked
- [quality-avoid-barrel-imports](rules/quality-avoid-barrel-imports.md) — import from the source file; author no `index.ts` barrels either
- [quality-code-comments](rules/quality-code-comments.md) — comment the "why", not the "what"
- [quality-list-keys](rules/quality-list-keys.md) — stable named list keys (`item.id`), never a bare index
- [quality-styling-tailwind](rules/quality-styling-tailwind.md) — Tailwind `className` + `cn`/`cva`, not inline `style`

### Forms (3)

- [forms-schema-driven](rules/forms-schema-driven.md) — one Zod schema drives validation and the inferred type, via `zodResolver`
- [forms-field-components](rules/forms-field-components.md) — compose fields with `Controller` + the `@monorepo/ui` `field` primitives
- [forms-use-watch](rules/forms-use-watch.md) — subscribe to fields with `useWatch`, not `watch` (isolated re-renders)

### Data & Server State — TanStack Query v5 (7)

- [tanstack-key-factory](rules/tanstack-key-factory.md) — the query-key factory pattern and the options wrappers
- [tanstack-use-query](rules/tanstack-use-query.md) — defining query hooks (object argument, array key, `...options` last)
- [tanstack-use-mutation](rules/tanstack-use-mutation.md) — defining mutation hooks; the global error toast, `onError` only for rollback
- [tanstack-use-infinite](rules/tanstack-use-infinite.md) — defining infinite-query hooks (`initialPageParam`, `getNextPageParam`, `select`)
- [tanstack-consume-query](rules/tanstack-consume-query.md) — consuming query hooks; `isLoading` vs `isFetching`, invalidate over `refetch`
- [tanstack-consume-mutation](rules/tanstack-consume-mutation.md) — consuming mutation hooks; `isPending`, no re-toast
- [tanstack-consume-infinite](rules/tanstack-consume-infinite.md) — consuming infinite-query hooks; the data is already flat

### Patterns — screen fetching and rendering (7)

- [patterns-parallel-fetching](rules/patterns-parallel-fetching.md) — fetch independent data in parallel; gate dependents with `enabled`
- [patterns-fetch-on-mount](rules/patterns-fetch-on-mount.md) — fetch on mount, never before; mount-gate hidden parts
- [patterns-self-fetching-components](rules/patterns-self-fetching-components.md) — each component fetches its own data (or one fetch for one entity)
- [patterns-self-fetching-inputs](rules/patterns-self-fetching-inputs.md) — reusable inputs fetch their own options
- [patterns-hooks-over-context](rules/patterns-hooks-over-context.md) — API hooks directly, not a screen-wide context
- [patterns-loading-skeletons](rules/patterns-loading-skeletons.md) — `isLoading` → a layout-matching skeleton, early-returned
- [patterns-debounce-search-input](rules/patterns-debounce-search-input.md) — debounce search inputs with `@monorepo/hook/use-debounce`

### State Management — Zustand v5 (2)

- [zustand-global](rules/zustand-global.md) — app-wide client state, flat in `~/stores/` (auth token, theme), read through narrow selectors
- [zustand-feature](rules/zustand-feature.md) — feature-scoped stores at the slice root; `useState` for single-component state

### Dates (2)

- [dates-dayjs-singleton](rules/dates-dayjs-singleton.md) — format through the `@monorepo/dayjs` singleton; no default timezone, formats from one table
- [dates-locale-render-input](rules/dates-locale-render-input.md) — pass `i18n.resolvedLanguage` to `.locale()`, or the React Compiler memoizes a stale locale

### Testing (2)

- [testing-coverage](rules/testing-coverage.md) — coverage is measured, not gated; test the behaviour you changed
- [testing-playwright](rules/testing-playwright.md) — `.e2e.ts` flows, an automatic but non-blocking CI job, two projects over one spec tree

### Meta

- [\_sections.md](rules/_sections.md) — section registry (prefixes, ordering, impact)
- [\_template.md](rules/_template.md) — scaffold for a new rule
