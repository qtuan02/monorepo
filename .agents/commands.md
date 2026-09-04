# Build & Development Commands

This monorepo uses **Bun** (`bun@1.4.0`) as the package manager and **Turborepo** as the task
runner. Root scripts delegate to `turbo run <task>`; **Biome is the exception** — it runs once from
the root with no Turbo fan-out. Run everything from the repo root unless noted.

`CLAUDE.md` §6 is the short version of this file. Where the two disagree, the `package.json`
scripts win and both files are wrong.

## Setup

- `bun install` — install every workspace dependency (reads `bun.lock`, `bunfig.toml`)
- Node **24 LTS** — `.nvmrc` pins `24.20.0`, `engines.node` reads `>=24.14.0`, and `@types/node`
  tracks the same 24.x line. The build runs on Bun; Node is a *runtime* dependency only for the
  Next Runtime, whose Docker runner is `node:24-alpine` running `node server.js`. The Vite
  Runtime's runner is plain nginx and has no Node at all.
- Bun — `engines.bun` reads `>=1.2.0`, but `packageManager` pins `bun@1.4.0`, which is the version
  to develop and run CI against.
- Copy `.env.example` to `.env` at the repo root before the first `dev` or `build`. There is one
  `.env` for the whole workspace; both Runtimes read it (ADR-0003).

## Development

- `bun run dev:template-vite` — the Vite Template app, `http://localhost:3000`
- `bun run dev:template-next` — the Next Template app, `http://localhost:3001`
- `bun run dev:storybook` — Storybook, `http://localhost:6006`

Each is `turbo watch dev -F @monorepo/<app>...`, so the app's workspace dependencies rebuild as you
edit them. Per-app: `cd apps/_template_vite && bun run dev`, or `bun run preview` to serve that
app's production build.

The Next app's `dev` and `build` go through **`dotenv-cli`** (`dotenv -e ../../.env -- next …`).
Next only auto-loads a `.env` beside its own `package.json`, and this repo deliberately keeps one at
the root instead — dropping the `dotenv` prefix silently starts the app with no env at all, which
surfaces as a t3-env validation throw rather than as a missing file.

## Build

- `bun run build` — build every package and app (Turbo)
- `bun run build:template-vite` / `bun run build:template-next` — one app plus its dependencies
- `bun run clean` — `git clean -xdf node_modules`
- `bun run clean:workspaces` — each workspace's own `clean` task

Packages are **source-only**: `private: true`, `exports` pointing straight at `src/`, no build step
and no `dist/`; nothing here is published to npm. So `build` only ever runs for the three apps; a package appears in the
graph for ordering, not for output.

## Lint, format & typecheck

- `bun run check` — Biome: formatter + linter + import sorting, one pass over the whole repo
- `bun run check:fix` — the same with `--write` (safe fixes only; unsafe ones need `--unsafe`)
- `bun run check:changed` — Biome over the changed files only
- `bun run typecheck` — `tsc --noEmit` across the monorepo, from `@monorepo/tsconfig`
- `bun run format` / `format:fix` — the formatter alone; `check` is what CI runs

Biome runs from the root because its `types` domain does whole-project inference — a per-workspace
fan-out would mean one project scan per workspace. Scope it by path instead:
`bunx biome check apps/_template_next`.

`legacy/` is excluded in `biome.json`, not in CI. Those apps are frozen on their old toolchain until
a migrate ticket brings each one back into `apps/` (ADR-0001), and linting them would produce
thousands of findings nobody is allowed to act on.

## Tests

- `bun run test` — Vitest 5 across every workspace that declares a `test` script
- `bun run test:coverage` — the same plus a v8 report; **no threshold, nothing gates on it**
- `bun run --filter @monorepo/_template_vite test:watch` — watch one app; the `/tdd` loop
- `bun run --filter @monorepo/i18n test test/locales/icu-parity.test.tsx` — one file

Never prefix any of these with `TZ=UTC`. The pin lives inside each `vitest.config.ts` — twice, in
fact: `process.env.TZ` at module scope **and** `env: { TZ: "UTC" }`, because Vitest 5's
`test.env.TZ` does not take effect under the `threads` pool. The shell-prefix form is also invalid
in PowerShell, which is the dev shell here.

Tests live in `<workspace>/test/`, mirroring the `src/` path of the file under test. Playwright
specs sit beside that tree in `<app>/e2e/*.e2e.ts` — the suffix is what keeps the two runners from
collecting each other's files.

**Vitest 5, not 4** — a deliberate choice to run ahead of the reference monorepo, which is still on
4.x. Two of its breaking changes bite when copying a config or a test
in from elsewhere: `clearMocks` now defaults to **`true`** (so every config here states it
explicitly, since an omitted value now means the opposite of what it used to), and Vitest 5 no
longer searches parent directories for a config — every workspace that runs tests needs its own
`vitest.config.ts`.

## E2E (Playwright)

- `bun run e2e` — both Template apps, headless; each `webServer` builds and serves the app itself,
  so never start a `dev` server first
- `bun run e2e:headed:template-vite` / `:template-next` — the same specs in one real browser window
  (the `watch` project, which reuses a single context for the whole run)
- `bunx playwright test e2e/home.e2e.ts` from inside the app directory — one spec

Two projects share one spec tree. `chromium` is what CI and `bun run e2e` use: a fresh browser
context per test, which is the isolation Playwright actually guarantees. `watch` trades that away
for one window you can watch, so a spec that passes only there is leaning on state a `chromium` run
wipes — never treat a `watch` pass as evidence.

**On Windows, run Playwright through `bunx playwright test` with the app directory as cwd**, not
through a `bun run` script: launching Chromium from a `bun run` script hangs on this machine.

## UI primitives (`@monorepo/ui`)

- `bun run --filter @monorepo/ui ui-add` — add a shadcn primitive into `packages/ui/src/components/`

It runs `bunx shadcn@4.20.1 add`, then Biome, then `scripts/guard-no-local-hooks.ts`. The CLI
version is pinned, not `@latest`, and deliberately: the `#hooks` arrangement below is built around
how 4.20.x resolves aliases, so an unpinned CLI could change that behaviour under the guard without
anything failing loudly. That guard is
meant to fire: `components.json` points the CLI's `hooks` alias at `#hooks`, a directory that
deliberately does not exist, because the CLI 4.20.x cannot be pointed at `@monorepo/hook` directly
(it validates every alias against the target package's `exports`, and a subpath-only package
produces an alias it can never match). So a primitive that wants a hook lands one in
`packages/ui/src/hooks/`, the guard fails the run, and the fix is to move it to `@monorepo/hook` and
re-point the import — the path `sidebar.tsx` already took to reach
`@monorepo/hook/use-is-mobile`.

`data-table` and `date-picker` are **not** registry items — shadcn publishes them as guides, and
`/r/styles/base-vega/{data-table,date-picker}.json` 404s. Both files here are hand-composed; a
`ui-add` run will not regenerate them.

## Generators

- `bun run gen:app` — scaffold a new app: prompts for the Runtime (`next` | `vite`), clones that
  Template app, rewrites its name, Dockerfile ARGs and root scripts, then installs and formats
- `bun run gen:package` — a new `packages/*` workspace
- `bun run gen:tooling` — a new `tooling/*` workspace

These call the `gen` binary directly rather than `bunx turbo gen`, which truncates its JSON argument
on Windows.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on a **push to any branch** plus `workflow_dispatch`. There is
deliberately no `pull_request` trigger: a check attaches to the head commit, so a push-triggered run
is what a required check on a PR resolves against — the second trigger would only run everything
twice.

| Job         | Runs                | Catches                                             |
| ----------- | ------------------- | --------------------------------------------------- |
| `check`     | `bun run check`     | format, lint, import sorting                        |
| `typecheck` | `bun run typecheck` | type errors across the monorepo                     |
| `test`      | `bun run test`      | behaviour regressions (Vitest, jsdom, pinned to UTC) |
| `build`     | `bun run build`     | breakage the first three miss — a bundler or Next config change |

Those four are **the Gate**, and `bun run check && bun run typecheck && bun run test && bun run build`
reproduces it exactly. A fifth job, `e2e`, runs when a `changes` job sees the diff touch `apps/`,
`packages/`, `tooling/`, `bun.lock` or the workflow, and carries `continue-on-error: true` — it
reports without blocking. Deleting that one line makes it a gate.

Three constraints on the `e2e` job, each of which has broken it before:

- The container tag must match `@playwright/test` in the `testing` catalog **exactly** (1.62.1) —
  the image bakes in the browser revision that version expects, which is why the catalog pins it
  without a caret. Bump both together.
- `PLAYWRIGHT_BROWSERS_PATH` has to survive into the test process. Turbo filters the environment in
  strict mode, and swallowing that variable surfaces as `Executable doesn't exist` for browsers
  sitting right there on disk. It is guarded twice: `turbo.json` declares it in the `e2e` task's
  `passThroughEnv`, and the CI job additionally calls each app's own script
  (`bun run --filter @monorepo/_template_vite e2e`) rather than `turbo run e2e`. Keep the
  `passThroughEnv` entry if you touch that task — `bun run e2e` locally *does* go through Turbo, and
  it is the only thing making that path work.
- The report is uploaded `if: always()`, because `continue-on-error` makes the job report green
  either way — the artifact is the only place a failure is visible.

## Notes

- `turbo.json` defines `topo` (ordering only), `build`, `dev`, `typecheck`, `test`, `test:coverage`,
  `e2e`, `clean` and `ui-add`. Lint and format are **not** Turbo tasks.
- Per-app `turbo.json` files `extends: ["//"]` and flip `dev.persistent: true` — that is why `dev:*`
  holds the terminal. The Next app additionally adds `.next/types/**` to its `typecheck` outputs.
- Versions are pinned with Bun **catalogs** in the root `package.json`: the default `catalog:` plus
  the named `next16`, `react19`, `react-router8`, `storybook10`, `tailwind4`, `tanstack-query5`,
  `tanstack-table9` and `testing`. Reference a catalog from a workspace `package.json`; never
  hardcode a version there.
- Moving a package **between** catalogs needs `bun.lock` edited by hand as well: `bun install` keeps
  reading the old spec from the lock and fails with `failed to resolve`, and `--force` does not
  help. Never delete `bun.lock` to work around it — that re-resolves every `^` range and drifts
  unrelated packages.
- Markdown is not formatted by any tool here (Biome does not format it), so this file, the rules and
  `CLAUDE.md` are hand-maintained.
