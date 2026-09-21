# Personal Monorepo — Agent Documentation Index

What lives here, and what each file is for:

- **[../CLAUDE.md](../CLAUDE.md)** — the main guide, always loaded: the top-level map, the one-way data
  flow, the "Where do I put X?" lookup, the six always-on conventions, the "read what when" router, the
  commands in short. `AGENTS.md` is a symlink to it.
- **[project-structure.md](project-structure.md)** — the full tree: every app and package, what each
  deliberately lacks, plus the Env and Flavor notes.
- **[workflow.md](workflow.md)** — the skills and who owns them, the repo overrides for the workflow skills
  (language, design step without Python, Runtime check, TDD loop, the Standards source for `/code-review`),
  the GitHub Issues tracker, and how to author a rule / ADR / skill.
- **[commands.md](commands.md)** — every command with the constraint attached: setup, dev, ports, Gate, E2E,
  generators, publish, CI.
- **[knowledge-base.md](knowledge-base.md)** — facts and gotchas no single file shows: Runtime and Flavor,
  the env pipeline, the ICU catalogue invariants, the HTTP layer, publishing, build tooling.
- **[rules/](rules/)** — the engineering rules, the source of truth for `/code-review`'s Standards axis.
  Registry: [rules/\_sections.md](rules/_sections.md); scaffold: [rules/\_template.md](rules/_template.md).
- **[skills/](skills/)** — 38 vendored skills from three owners; only the `skills`-CLI set is pinned in
  [../skills-lock.json](../skills-lock.json). Ownership and re-sync commands: `workflow.md` §1.
- **[plans/](plans/)** — the **former** tracker, frozen read-only. Work is now GitHub Issues on
  `qtuan02/monorepo` — `workflow.md` §3, [../docs/agents/issue-tracker.md](../docs/agents/issue-tracker.md).
- **[settings.json](settings.json)** — Claude Code settings for this repo (`plansDirectory`, plugins, MCP servers).
- **[../docs/guides/skills-workflow.md](../docs/guides/skills-workflow.md)** — the human walkthrough
  (Vietnamese) of the skill chain and every rule cluster.

Not owned here: [`../docs/agents/`](../docs/agents/) holds the config the workflow skills read (tracker,
triage labels, domain docs); [`../.mcp.json`](../.mcp.json) registers Context7 and GitNexus. `../.claude`
is a symlink to this directory, so there is one tree to maintain.

Language: rules are English so they stay diffable against the Reference monorepo; `CLAUDE.md` §4,
`workflow.md` §2 and the Vietnamese docs (`CONTEXT.md`, ADRs, design briefs, plans) are Vietnamese.

The stack the rules are written for is in `CLAUDE.md` § Tech Stack. Every rule names the Runtime it applies
to when it applies to only one; the three shapes never coexist in one app.

## Rules Index

52 rules across 12 clusters, plus the two meta files.

### Architecture (6)

- [architecture-vertical-slices](rules/architecture-vertical-slices.md) — organize by domain under `~/features`; a slice is a complete vertical
- [architecture-circular-dependencies](rules/architecture-circular-dependencies.md) — imports point downward through the layers, in all three Runtimes
- [architecture-feature-boundaries](rules/architecture-feature-boundaries.md) — consume a slice through its public surface (`templates/`, `provider/`, `guard/`, `middleware/`)
- [architecture-features-modules](rules/architecture-features-modules.md) — framework-agnostic `@monorepo/api` service classes vs `~/hooks/api` query hooks
- [architecture-ui-primitives](rules/architecture-ui-primitives.md) — use and extend the `@monorepo/ui` primitives (`render` prop, bare `data-open`, never `asChild`)
- [architecture-shared-components](rules/architecture-shared-components.md) — use and extend the shared composites in `~/components` (`exception/`, `page/`, `select/`)

### Routing — Vite Runtime (2)

`_template_vite` and its clones, on React Router 8 declarative.

- [routing-constants](rules/routing-constants.md) — every path comes from the `ROUTES` table in `~/constants/routes.ts`; imports from `react-router` / `react-router/dom`
- [routing-route-guards](rules/routing-route-guards.md) — auth/redirect guards at the route tree, in `~/features/auth/provider/` (`<ProtectedRoute>` / `<GuestRoute>`)

### React Router framework mode — React Router Runtime (6)

`_template_reactrouter` and its clones: the route config in `src/routes.ts`, route middleware over a signed session cookie, served by `react-router-serve`.

- [reactrouter-route-modules](rules/reactrouter-route-modules.md) — the route config is data in `src/routes.ts`; a module under `src/routes/` stays thin over the slice's template
- [reactrouter-typed-href](rules/reactrouter-typed-href.md) — paths come from the typed `href()` typegen writes, not a `~/constants/routes.ts` table
- [reactrouter-middleware-guards](rules/reactrouter-middleware-guards.md) — access control as route middleware in a slice's `middleware/`, over a signed session cookie
- [reactrouter-loader-vs-query](rules/reactrouter-loader-vs-query.md) — a loader owns what the first HTML must carry, TanStack Query owns everything after paint
- [reactrouter-server-modules](rules/reactrouter-server-modules.md) — the `.server.ts` suffix keeps server-only code out of the browser bundle
- [reactrouter-i18n-env](rules/reactrouter-i18n-env.md) — the i18next Flavor cloned per request, and the `react-router` env Flavor with a `server` block beside `PUBLIC_`

### Next.js App Router — Next Runtime (6)

`_template_next` and its clones: Next 16, `cacheComponents`, `reactCompiler`, `proxy.ts` on the Node runtime.

- [next-app-router-structure](rules/next-app-router-structure.md) — `src/app/` is the path table plus framework wiring; the slice owns the screen
- [next-server-vs-client-components](rules/next-server-vs-client-components.md) — Server Component by default; `"use client"` is a deliberate, low boundary
- [next-data-fetching](rules/next-data-fetching.md) — cached server read (`"use cache"`) for what a crawler reads, TanStack Query for what a visitor does
- [next-proxy-guards](rules/next-proxy-guards.md) — access control in `proxy.ts`, decided by a pure function over an `HttpOnly` cookie; the redirect target is parsed, not pattern-matched
- [next-i18n-next-intl](rules/next-i18n-next-intl.md) — the locale is a URL segment; three wiring files; one shared ICU catalogue
- [next-env-t3](rules/next-env-t3.md) — the `next` env Flavor: the `server`/`client` split, `NEXT_PUBLIC_`, literal `clientRuntimeEnv` reads, dotenv-cli

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
- [testing-playwright](rules/testing-playwright.md) — `.e2e.ts` flows, local only, two projects over one spec tree

### Meta

- [\_sections.md](rules/_sections.md) — section registry (prefixes, ordering, impact)
- [\_template.md](rules/_template.md) — scaffold for a new rule
