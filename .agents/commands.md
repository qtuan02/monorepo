# Commands — the full reference

Run everything from the repo root unless a line says otherwise. **Bun** (`bun@1.4.0`) is the package
manager, **Turborepo** the task runner. Every root script is `turbo run <task>` except Biome, which runs
once from the root with no Turbo fan-out.

`CLAUDE.md` §6 is the short form of this file. If the two disagree with `package.json`, the scripts win
and both files need a fix.

## Setup

- `bun install` — install every workspace (reads `bun.lock`, `bunfig.toml`).
- Copy `.env.example` to `.env` at the repo root before the first `dev` or `build`. One `.env` serves the
  whole workspace; all three Runtimes read it (ADR-0003, ADR-0006).
- Pins: Node **24** (`.nvmrc` = `24.20.0`, `engines.node >= 24.14.0`), Bun **1.4.0** (`packageManager`;
  `engines.bun >= 1.2.0` is only the floor). Node is a runtime dependency only for the two server
  Runtimes — their Docker runners are `node:24-alpine`. The Vite Runtime ships on nginx with no Node.

## Development

- `bun run dev:<app>` — `template-vite` 3000 · `template-next` 3001 · `portfolio` 3002 · `documents` 3003 ·
  `mcp` 3004 · `template-reactrouter` 3005 · `smart-rental` 3006 · `chat` 3007 · `storybook` 6006.
- Each is `turbo watch dev -F @monorepo/<app>...`, so the app's workspace dependencies rebuild as you edit
  them. Per app: `cd apps/<app> && bun run dev`.
- `bun run preview` (Vite Runtime only) serves the production build on the app's **E2E** port, so dev and
  preview can run side by side. The two server Runtimes have `bun run start` instead (`next start`,
  `react-router-serve`) — their builds carry a server bundle that `vite preview` cannot serve.

### Ports

- Every app states its two ports in `apps/<app>/ports.env` — `PORT` (dev, `3000 + n`) and `E2E_PORT`
  (`3100 + n`). That file is the only place the numbers are written; its own comments explain the design.
  `apps/<app>/ports.ts` reads it for `vite.config.ts` and `playwright.config.ts`; the Next `dev`/`start`
  scripts and the React Router `start` script hand it to dotenv-cli because those CLIs read `PORT` only.
- Storybook sits outside both bands on 6006 and has no `ports.env`.
- `bun run gen:app` assigns a new app the lowest free pair. Confirm it by starting the new app beside its
  Template, not with `bun run e2e` — Playwright reuses a server already on the port, so a collision reads
  as a pass.
- The `ENV PORT=3000` / `EXPOSE 3000` literals in the two server Dockerfiles are the port *inside* the
  container and unrelated to this pair.

### dotenv-cli in the two server Runtimes

Neither `next` nor `react-router-serve` loads a `.env` outside its own directory, and the repo keeps one
at the root — so those scripts name it:

| App | Script | Prefix |
|---|---|---|
| Next | `dev`, `start` | `dotenv -e ./ports.env -e ../../.env --` |
| Next | `build` | `dotenv -e ../../.env --` (a build binds no port) |
| React Router | `start` | `dotenv -e ./ports.env -e ../../.env --` |
| React Router | `dev`, `prebuild`, `build` | `dotenv -e ../../.env --` (`react-router dev` is a Vite server; it takes its port from `vite.config.ts`) |

- `ports.env` comes **first** because dotenv-cli never overrides a key already set. That is how
  Playwright's `webServer.env.PORT` moves the E2E server onto the E2E port while `start` still defaults to
  dev. It matters most for `react-router-serve`: with `PORT` unset it picks the first free port instead of
  failing.
- Dropping the prefix starts the app with an empty `process.env`. The symptom is a validation throw from
  `env.ts`, not a missing-file error.
- `react-router build` never evaluates `src/env.ts`, so that app has a `prebuild` that imports it under the
  same `.env` — a missing key fails there, by name (ADR-0006).
- A Vite app needs none of this: `vite.config.ts` sets `envDir: "../../"`.

## Build

- `bun run build` — every app plus `@monorepo/ui` and `@monorepo/hook` (Turbo).
- `bun run build:<app>` — one app plus its dependencies.
- `bun run clean` — `git clean -xdf node_modules`; `bun run clean:workspaces` — each workspace's own `clean`.

What `build` produces:

- Six packages (`api`, `dayjs`, `env`, `i18n`, `sentry`, `types`) and both `tooling/*` workspaces are
  source-only: `private: true`, `exports` into `src/`, no `dist/`. They appear in the graph for ordering only.
- `@monorepo/ui` and `@monorepo/hook` are also source-only for the apps here, but each has a `build` task
  (rslib, **bundleless** — one `.js` + one `.d.ts` per source file) whose output lands in its **Publish
  shell**: `packages/ui-public/dist`, `packages/hook-public/dist` (ADR-0004). `hook` runs `rslib build`;
  `ui` runs `bun scripts/build.ts`, which empties the shell's `dist/`, compiles, writes `dist/globals.css`
  from `@monorepo/tailwind-config`, and asserts every relative import in the output resolves.
- Those two override `build.outputs` in their own `turbo.json` to the shell path (`../ui-public/dist/**`),
  so a `FULL TURBO` hit restores a wiped shell `dist/`. The shells need no `build` task.
- `typecheck` and `test` declare `dependsOn: ["^topo", "^build"]`, so those two builds run in both graphs.
- Every Next app's `build` is `"cache": false` — see `knowledge-base.md` § Build & tooling for why.

## Lint, format & typecheck

- `bun run check` — Biome: formatter + linter + import sorting, one pass, whole repo. This is what CI runs.
- `bun run check:fix` — the same with `--write` (safe fixes; unsafe ones need `--unsafe`).
- `bun run check:changed` — changed files only.
- `bun run format` / `format:fix` — the formatter alone.
- `bun run typecheck` — `tsc --noEmit` per workspace, from `@monorepo/tsconfig`.

Biome runs from the root because its `types` domain does whole-project inference. Scope it by path:
`bunx biome check apps/_template_next`.

## Tests (Vitest)

- `bun run test` — every workspace with a `test` script.
- `bun run test:coverage` — plus a v8 report. No threshold; nothing gates on it.
- `bun run --filter @monorepo/<workspace> test:watch` — one workspace; the `/tdd` loop.
- `bun run --filter @monorepo/i18n test test/locales/icu-parity.test.tsx` — one file.

Rules that hold for every test run:

- Never prefix a command with `TZ=UTC`. The pin lives in each `vitest.config.ts` — twice: `process.env.TZ`
  at module scope **and** `env: { TZ: "UTC" }`, because Vitest 5's `test.env.TZ` is ignored under the
  `threads` pool. The shell-prefix form is also invalid in PowerShell.
- Tests live in `<workspace>/test/`, mirroring the `src/` path of the file under test. Playwright specs
  live in `<app>/e2e/*.e2e.ts`; the suffix keeps the two runners from collecting each other's files.
- **Vitest 5, not 4** (the Reference monorepo is on 4.x). Two breaking changes bite when copying a config or
  a test from elsewhere: `clearMocks` now defaults to `true` (every config here states it explicitly), and
  Vitest 5 no longer searches parent directories for a config (every workspace that runs tests has its own
  `vitest.config.ts`).

## E2E (Playwright) — local only

E2E does **not** run in CI (dropped 2026-09-19). It is a local check for anything touching a route, a
guard, `proxy.ts`, `src/routes.ts`, a `loader`/`action`/middleware, `entry.server.tsx`, or the boot path.

- `bun run e2e` — every app with a `playwright.config.ts`, headless. Each config's `webServer` builds and
  serves the app itself; never start a `dev` server first.
- `bun run e2e:headed:template-vite` / `:template-next` / `:template-reactrouter` — the same specs in one
  browser window (the `watch` project).
- `bunx playwright test e2e/home.e2e.ts` from inside the app directory — one spec.

Two projects share one spec tree. `chromium` gives a fresh browser context per test — the isolation
Playwright guarantees. `watch` reuses one context so you can watch it; a spec that passes only there leans
on state `chromium` wipes, so a `watch` pass is not evidence.

**On Windows, run Playwright as `bunx playwright test` with the app directory as cwd.** Launching Chromium
from a `bun run` script hangs on this machine.

## UI primitives (`@monorepo/ui`)

- `bun run --filter @monorepo/ui ui-add` — add a shadcn primitive into `packages/ui/src/components/`.

It runs `bunx shadcn@4.20.1 add`, then Biome, then `scripts/guard-no-local-hooks.ts`:

- The CLI version is pinned because the `#hooks` arrangement below depends on how 4.20.x resolves aliases.
- `components.json` points the CLI's `hooks` alias at `#hooks`, a directory that does not exist. The CLI
  validates every alias against the target package's `exports`, and `@monorepo/hook` is subpath-only, so it
  cannot be the alias target. When a primitive needs a hook, the CLI writes it to `packages/ui/src/hooks/`,
  the guard fails the run, and you move the hook to `@monorepo/hook` and re-point the import — the path
  `sidebar.tsx` took to reach `@monorepo/hook/use-is-mobile`.
- `data-table` and `date-picker` are not registry items (shadcn publishes them as guides; the JSON 404s).
  Both files here are hand-composed and `ui-add` will not regenerate them.

## Generators

- `bun run gen:app` — prompts for the Runtime (`next` | `vite` | `reactrouter`), clones that Template app,
  rewrites its name, Dockerfile ARGs and root scripts, assigns the next free port pair into `ports.env`,
  then installs and formats. The last line of the run names the pair.
- `bun run gen:package` — a new `packages/*` workspace.
- `bun run gen:tooling` — a new `tooling/*` workspace.

These call the `gen` binary directly; `bunx turbo gen` truncates its JSON argument on Windows.

## Publish (npm)

- `bun run changeset` — write a release note for `@fe-monorepo/ui` and/or `@fe-monorepo/hook`. Only those
  two are offered: every other workspace is `private: true` and `.changeset/config.json` sets
  `privatePackages.version: false`. Write one when the diff changes what an npm consumer receives — a
  primitive, a hook, a shell's `exports`/`dependencies`/`peerDependencies`, anything in `tooling/tailwind/`,
  or the build that fills `dist/` — and commit the generated `.changeset/<name>.md` with the change. A
  change touching both packages needs **two** entries (`ui` does not depend on `hook`); see
  `.changeset/README.md`.
- `bun run publish:smoke` — `scripts/publish-smoke.ts`: build both shells, `npm pack` each, scaffold a
  throwaway Vite + React 19 + Tailwind v4 project under `os.tmpdir()`, install the two tarballs like a
  consumer, run `tsc --noEmit` and `vite build`. It asserts what only fails once published: no `catalog:` or
  `workspace:` range in an installed manifest, no `@monorepo/` or `#…` specifier in a `dist/`, and — read
  from the CSS Vite emitted — that the stylesheet reached the consumer's Tailwind. `--keep` leaves the
  project on disk. Takes minutes (network install).
- `bun run release` — **CI only** (`build:publishable && changeset publish`). There is no `NPM_TOKEN`
  anywhere; `release.yml` publishes through npm trusted publishing (OIDC), so a local run rebuilds both
  shells and then dies at npm. `bun run version-packages` is likewise the action's `version-script`. Details
  in `knowledge-base.md` § Publishing.
- `bun run build:publishable` — `turbo run build --filter @monorepo/ui --filter @monorepo/hook`, the one
  place that filter pair is written.
- `bun run changeset status --since=origin/main` (what CI runs) reads committed files only, so stage a new
  changeset before trusting its verdict locally.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on a **push to any branch** plus `workflow_dispatch`. There is no
`pull_request` trigger on purpose: a check attaches to the head commit, so a push-triggered run is what a
required check resolves against; a second trigger would run everything twice.

| Job | Runs | Catches |
|---|---|---|
| `check` | `bun run check` | format, lint, import sorting |
| `typecheck` | `bun run typecheck` | type errors |
| `test` | `bun run test` | behaviour regressions (Vitest, jsdom, UTC) |
| `build` | `bun run build` | what the first three miss — a bundler or Next config change |

Those four are **the Gate**; `bun run check && bun run typecheck && bun run test && bun run build`
reproduces it exactly. Three more jobs report without blocking (`continue-on-error: true` — delete that
line to make one a gate). A `changes` job decides which run:

| Job | Runs when the diff touches | Does |
|---|---|---|
| `docker` | `apps/`, `packages/`, `tooling/`, `bun.lock`, `ci.yml` | one `docker build` per app that ships a Dockerfile (matrix from `find apps -mindepth 2 -maxdepth 2 -name Dockerfile`), `push: false`, cache per app |
| `changeset-status` | `packages/{ui,hook,ui-public,hook-public}/`, `tooling/tailwind/`, `scripts/`, `.changeset/`, `bun.lock`, either workflow | `changeset status --since=origin/main` |
| `publish-smoke` | same as above | `build:publishable` then `publish:smoke` |

A brand-new branch or a `workflow_dispatch` has no base commit and counts as "everything touched".

Constraints each job depends on:

- `docker`: build context is the **repo root** (every pruner stage does `COPY . .` + `turbo prune`; the
  Vite runner reads `apps/<app>/nginx.conf` from the context). `.dockerignore` keeps `.env.example`,
  `apps/*/nginx.conf` and the lockfile. No `--build-arg`: the builder does `COPY .env.${BUILD_ENV} .env`
  with `BUILD_ENV` defaulting to `example`, and `gen:app` wrote each Dockerfile's `APP_DIRNAME`/`PROJECT`.
  Not routed through Turbo (no `docker` task; strict-mode env filtering would sit between the job and
  buildx). It builds images and never runs a container, so `docker build` is all it proves.
- `changeset-status`: skipped on `main` (there `origin/main` is the commit under test, so `--since` would
  compare it to itself). It first runs `git fetch --no-tags origin main:refs/remotes/origin/main`, because
  `actions/checkout` fetches only the pushed ref.
- `publish-smoke`: runs `build:publishable` first — both shells' `dist/` are gitignored and empty on a
  fresh checkout.

Publishing is a second workflow, `release.yml`, on `main` only — see **Publish** above.

## Notes

- `turbo.json` tasks: `topo` (ordering only), `build`, `dev`, `typecheck`, `test`, `test:coverage`, `e2e`
  (`passThroughEnv: ["PLAYWRIGHT_BROWSERS_PATH"]`), `clean`, `ui-add`. Lint and format are not Turbo tasks.
- Per-app `turbo.json` files `extends: ["//"]` and set `dev.persistent: true`, which is why `dev:*` holds
  the terminal. Each server Runtime lists its typegen output in `typecheck.outputs` — `.next/types/**` for
  Next, `.react-router/**` for React Router (`react-router typegen` runs as the first half of that task; a
  cache hit would otherwise restore the tsbuildinfo without the `+types` it was built from).
- Dependency versions come from Bun **catalogs** in the root `package.json` — the default `catalog:` plus
  `next16`, `react19`, `react-router8`, `storybook10`, `tailwind4`, `tanstack-query5`, `tanstack-table9`,
  `testing`. A workspace `package.json` references a catalog, never a literal version.
- Moving a package **between** catalogs also needs `bun.lock` edited by hand: `bun install` keeps reading
  the old spec and fails with `failed to resolve`; `--force` does not help. Never delete `bun.lock` to get
  around it — that re-resolves every `^` range.
- No tool formats Markdown here (Biome does not), so this file, the rules and `CLAUDE.md` are
  hand-maintained.
