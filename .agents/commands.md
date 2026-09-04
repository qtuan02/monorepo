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
app's production build — `preview` binds the app's **E2E** port, not its dev port, so both can be
up at once.

Neither number is written in a script or a config (the one literal left is `ENV PORT=3000` /
`EXPOSE 3000` in `apps/_template_next/Dockerfile` — the port *inside* the container, which has its
own network namespace and is deliberately unrelated to this pair; the comment there says so). Each
app states both of its ports in `apps/<app>/ports.env` — `PORT` and `E2E_PORT`, one pair per app,
dev `3000 + n` and e2e `3100 + n` — and everything else reads that file: `apps/<app>/ports.ts` for
the two TypeScript configs (`vite.config.ts` takes `server.port` and `preview.port` from it, both `playwright.config.ts`
take `E2E_PORT`), and dotenv-cli for the Next app's scripts. `apps/storybook` sits outside both bands
on Storybook's own 6006, has no E2E server, and declares no `ports.env`. Moving a port is one edit in
that file; `bun run gen:app` assigns a new app the lowest free pair the same way.

The Next app's scripts go through **`dotenv-cli`**: `dev` and `start` as
`dotenv -e ./ports.env -e ../../.env -- next …`, `build` with the root file only (`next build` takes
no port). Next only auto-loads a `.env` beside its own `package.json`, and this repo deliberately
keeps one at the root instead — dropping the `dotenv` prefix silently starts the app with no env at
all, which surfaces as a t3-env validation throw rather than as a missing file. The `-e ./ports.env`
comes **first** because dotenv-cli does not override a key already set: that is what lets
Playwright's `webServer.env` put `PORT` in the environment and land the E2E server on the E2E port
while `start` still defaults to the dev one.

## Build

- `bun run build` — build every package and app (Turbo)
- `bun run build:template-vite` / `bun run build:template-next` — one app plus its dependencies
- `bun run clean` — `git clean -xdf node_modules`
- `bun run clean:workspaces` — each workspace's own `clean` task

Most packages are **source-only**: `private: true`, `exports` pointing straight at `src/`, no build
step and no `dist/`. That still describes six of the ten — `api`, `dayjs`, `env`, `i18n`, `sentry`,
`types` — plus both `tooling/*` workspaces, and each of those appears in the graph for ordering, not
for output.

The two exceptions are `@monorepo/ui` and `@monorepo/hook`. Both are still `private: true` and both
still hand every app in this repo their `src/`, but each now carries a `build` task that compiles that
same source into the matching **Publish shell** — `packages/ui-public/dist` and
`packages/hook-public/dist`, the only two workspaces npm ever sees (ADR-0004). The task is rslib in
**bundleless** mode, so one source file becomes one `.js` plus one `.d.ts` and the shells' subpath
`exports` resolve file-for-file. `@monorepo/hook` runs `rslib build` directly; `@monorepo/ui` goes
through `bun scripts/build.ts`, because two jobs bracket the compile — empty the shell's `dist/`
first, then generate its `dist/globals.css` from `@monorepo/tailwind-config` and assert every relative
import in the output resolves to a file that exists.

So `bun run build` is every app plus those two packages, not the apps alone. Each of those two
packages overrides `build.outputs` in its own `turbo.json` to a path **outside** itself
(`"../ui-public/dist/**"`), which Turbo caches and restores correctly — a wiped shell `dist/` comes
back whole on a `FULL TURBO` hit, which is why neither shell needs a `build` task of its own.
`typecheck` and `test` both declare `dependsOn: ["^topo", "^build"]`, so those two builds are pulled
into both of those graphs as well.

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
  Template app, rewrites its name, Dockerfile ARGs and root scripts, **assigns it the next free
  dev/E2E port pair in `apps/<app>/ports.env`**, then installs and formats. The pair is the lowest
  slot whose *both* ports are free across every `apps/*/ports.env`, so deleting a generated app
  returns its slot to the pool. The run's last line names the pair it took; confirm it by starting
  the new app beside its Template, not with `bun run e2e` — Playwright reuses a server already on
  the port, so a collision reads as a pass
- `bun run gen:package` — a new `packages/*` workspace
- `bun run gen:tooling` — a new `tooling/*` workspace

These call the `gen` binary directly rather than `bunx turbo gen`, which truncates its JSON argument
on Windows.

## Publish (npm)

- `bun run changeset` — write a release note for one or both Publish shells
- `bun run publish:smoke` — pack both shells and install them into a throwaway consumer project
- `bun run release` — **CI only**: fill both shells, then `changeset publish`

`changeset` opens the Changesets prompt, and only `@fe-monorepo/ui` and `@fe-monorepo/hook` are ever
offered: every other workspace is `private: true` and `.changeset/config.json` sets
`privatePackages.version: false`, so a release plan cannot name an app, a `tooling/*` workspace, or a
`@monorepo/*` package. Write one when the diff changes what someone **outside** the repo receives — a
primitive under `packages/ui/src/components/`, a hook under `packages/hook/src/`, a shell's
`exports` / `dependencies` / `peerDependencies`, the CSS entry (so anything in `tooling/tailwind/`),
or the way the build fills `dist/` — and commit the generated `.changeset/<name>.md` alongside the
change itself. [`.changeset/README.md`](../.changeset/README.md) is the long form, including why a
change touching both packages needs **two** entries rather than one: `@fe-monorepo/ui` does not depend
on `@fe-monorepo/hook`, it inlines the single hook it uses. Note also that
`bun run changeset status --since=origin/main` — what the CI job runs — reads committed files only, so
a new changeset has to be staged before its verdict means anything locally.

`publish:smoke` is `bun scripts/publish-smoke.ts`, and it is the one seam that tests the *tarball*
rather than the source. It builds both shells, `npm pack`s each of them (the same tool
`changeset publish` shells out to), scaffolds a throwaway Vite + React 19 + Tailwind v4 project
**outside** the workspace, installs the two tarballs the way a consumer would, then runs
`tsc --noEmit` and `vite build` over it. Along the way it asserts exactly what only fails once
published: no `catalog:` or `workspace:` range left in an installed manifest, no `@monorepo/` or
`#components` / `#utils` / `#hooks` specifier left in a `dist/`, and — read back out of the CSS Vite
emitted, not out of the shipped file — that the stylesheet actually reached the consumer's Tailwind.
Pass `--keep` to leave the project on disk and print its path.

Two things about running it here. It creates that project under the **operating system's** temp
directory (`os.tmpdir()`), never `/tmp`, so it works unchanged on the Windows dev box; and it quotes
every argument it spawns, because `bun`, `bunx` and `npm` are `.cmd` shims that only resolve through a
shell, and a shell re-splits a tarball path sitting under `C:\Users\First Last\…`. It also installs
from the network and builds a real project, so it takes minutes rather than seconds — which is why its
CI job carries `continue-on-error: true` while it proves it is not flaky.

`release` is `bun run build:publishable && changeset publish`, and **it is not a command to run by
hand**. `.github/workflows/release.yml` invokes it as `changesets/action`'s `publish-script`, and
there is no `NPM_TOKEN` anywhere in this repo: publishing authenticates through npm **trusted
publishing**, where that job's `id-token: write` permission mints a short-lived OIDC token npm
exchanges for publish rights — which turns on provenance attestation at the same time. Locally there
is no token to mint, so the publish dies at npm having already rebuilt both shells. The same holds for
`bun run version-packages` (`changeset version`): the action runs it as its `version-script` on a push
to `main` that still carries a changeset, which is what opens the "Version Packages" PR, and merging
that PR is what triggers the publish pass. `bun run build:publishable` is nothing but
`turbo run build --filter @monorepo/ui --filter @monorepo/hook`, pulled out so that filter pair is
written once — the `publish-smoke` CI job calls the same script.

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
reproduces it exactly. Four more jobs sit outside the Gate, each carrying `continue-on-error: true`
— they report without blocking, and deleting that one line makes any of them a gate. Two of them,
`e2e` and `docker`, run when a `changes` job sees the diff touch `apps/`, `packages/`, `tooling/`,
`bun.lock` or the workflow; the other two, `changeset-status` and `publish-smoke`, run on a second
output of that same job — `packages/{ui,hook,ui-public,hook-public}/`, `tooling/tailwind/`, `scripts/`,
`.changeset/`, `bun.lock` and either workflow file. That is the published surface rather than an app,
which is why `apps/` is deliberately absent from it (an app-only diff cannot change a tarball) and
`.changeset/` just as deliberately absent from the first (a release note cannot change a screen).
`e2e` drives Playwright over both
Template apps. `docker` builds one image per app that ships a Dockerfile (`push: false`,
`load: false`, GitHub Actions cache scoped per app), with the matrix derived by
`find apps -mindepth 2 -maxdepth 2 -name Dockerfile` rather than listed — a migrate ticket adds no
name anywhere.

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

Two constraints on the `docker` job:

- The build context is the **repo root**, never the app directory. Every pruner stage opens with
  `COPY . .` + `bunx turbo prune`, and the Vite runner reads `apps/<app>/nginx.conf` out of that
  context rather than out of a stage. `.dockerignore` is what keeps it small, and it deliberately
  does not ignore `.env.example`, `apps/*/nginx.conf` or the lockfile.
- It passes **no** `--build-arg`. Env does not reach these images through an ARG at all — the builder
  does `COPY .env.${BUILD_ENV} .env` with `BUILD_ENV` already defaulting to `example`, and `gen:app`
  has written each Dockerfile's `APP_DIRNAME`/`PROJECT` per app. Passing `BUILD_ENV` anyway would
  warn on the Storybook image, which declares no such ARG.

It builds images and never starts a container, so `docker build` is all it proves; a runtime check
(the Vite image answering 404 for a missing file, the Next image serving an SSR page) needs
`load: true` and a `docker run`, which this job does not do. And as with `e2e`, the job always
reports green — with no artifact uploaded, the build log is the only place a failure shows.

One constraint each on the publish pair:

- `changeset-status` is additionally skipped on `main` itself, where `origin/main` **is** the commit
  under test: `--since` would compare it against itself, find no changed package, and report green
  without having asserted anything. It also has to `git fetch --no-tags origin main:refs/remotes/origin/main`
  first — `actions/checkout` fetches the pushed ref and nothing else, so the command would otherwise
  die on an unknown revision rather than on a missing changeset.
- `publish-smoke` runs `bun run build:publishable` before the script, because the script packs `dist/`
  and both shells' `dist/` are gitignored — empty on a fresh checkout. Only the two source packages
  are built there; no app can change a tarball.

Publishing itself is a **second workflow**, `.github/workflows/release.yml`, which runs only on `main`
and is described under **Publish** above.

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
