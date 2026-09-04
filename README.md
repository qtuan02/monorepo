# Personal Monorepo

A Bun + Turborepo workspace where every app is cloned from a **Template app** and every app runs
through the same four-command **Gate**. Two Runtimes are supported today — a Vite SPA behind nginx,
and Next.js App Router on Node — and a shared set of source-only packages serves both.

The full map for humans and agents is in **[`CLAUDE.md`](./CLAUDE.md)**; this file is the
short path from a clone to a running app.

## Requirements

| Tool | Version | Where it is pinned |
| --- | --- | --- |
| Node | **24 LTS** | [`.nvmrc`](./.nvmrc) (`24.20.0`), `engines.node` `>=24.14.0` |
| Bun | **1.4.0** | `packageManager` in [`package.json`](./package.json) |

Bun is the package manager and the script runner; Turborepo orchestrates tasks across workspaces.
There is no npm/pnpm/yarn lockfile here.

### Windows: clone with symlinks enabled

Two paths here are git **symlinks**: `.claude` → [`.agents`](./.agents), and `AGENTS.md` →
[`CLAUDE.md`](./CLAUDE.md). Each gives a tool the name it looks for without a second copy to keep in
sync. Git on Windows silently checks a symlink out as a plain text file unless symlinks are enabled:

```bash
git clone -c core.symlinks=true <url>
```

That also needs **Developer Mode** switched on (Settings → System → For developers), which grants a
non-elevated process the privilege to create symlinks. On an existing clone, turn it on and re-check
the file out:

```bash
git config core.symlinks true
git checkout -- .claude AGENTS.md
git ls-files -s .claude AGENTS.md   # both must print mode 120000
```

If either prints `100644`, the symlink was flattened into a file — fix it before committing, or the
next commit replaces the link with a one-line text file for everyone.

> PowerShell 5.1's `New-Item -ItemType SymbolicLink` refuses even with Developer Mode on. `git`,
> `mklink`, and `ln -s` under Git Bash all work.

## Install and run

```bash
cp .env.example .env          # one .env for the whole workspace; both Runtimes read it
bun install

bun run dev:template-vite     # Vite Template app  → http://localhost:3000
bun run dev:template-next     # Next Template app  → http://localhost:3001
bun run dev:storybook         # Storybook          → http://localhost:6006
```

`.env` is gitignored and is the single source of environment truth. `.env.example` lists both
prefixes — `PUBLIC_*` for the Vite Runtime, `NEXT_PUBLIC_*` (plus unprefixed server-only keys) for
the Next Runtime. A missing or invalid value throws at startup with a named error rather than
failing later in a strange place (see [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md)).

## The Gate

Four commands. They are what [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs, so running
them locally reproduces CI exactly:

```bash
bun run check && bun run typecheck && bun run test && bun run build
```

| Command | What it is |
| --- | --- |
| `bun run check` | Biome — formatter, linter and import sorting in one pass over the whole repo |
| `bun run typecheck` | `tsc --noEmit` (TypeScript 7) across every workspace |
| `bun run test` | Vitest 5 — jsdom + Testing Library in the apps, node in most packages (`i18n` runs jsdom too) |
| `bun run build` | every app and package |

A fifth CI job runs Playwright when the diff touches `apps/`, `packages/`, `tooling/`, `bun.lock` or
the workflow. It carries `continue-on-error: true`, so it reports without blocking a merge.

```bash
bun run e2e                        # both Template apps, headless
bun run e2e:headed:template-vite   # one real browser window you can watch
```

Every command, with the constraints attached to each, is in
[`.agents/commands.md`](./.agents/commands.md).

## Creating a new app

```bash
bun run gen:app
```

It asks for the app name and the **Runtime**, clones the matching Template app, rewrites its
package name, Dockerfile build args and the root `dev:` / `build:` scripts, then installs and
formats. Pick the Runtime by whether the app needs to be crawlable:

| Need | Runtime | Cloned from | Runs in production as |
| --- | --- | --- | --- |
| Public, indexable, content before JS loads | Next.js | `apps/_template_next` | `node server.js` (`output: "standalone"`) on `node:24-alpine`, or Vercel zero-config |
| Internal, behind a login, no crawler | Vite client | `apps/_template_vite` | a static build served by nginx |

`bun run gen:package` and `bun run gen:tooling` scaffold a `packages/*` or `tooling/*` workspace the
same way.

## Layout

```
apps/          _template_next · _template_vite · storybook
packages/      env · i18n · dayjs · hook · types · api · ui · sentry   (source-only, private)
tooling/       tailwind · typescript
turbo/         generators
legacy/        frozen pre-rebuild apps — outside the workspace
docs/          adr/ · agents/ · research/
.agents/       rules/ · skills/ · plans/ (the tracker) · commands.md · knowledge-base.md
```

Packages are **source-only**: `private: true`, `exports` pointing straight at `src/`, no build step
and no `dist/`. Import the concrete file — `@monorepo/ui/components/button`, not a package root.
Nothing here is published to npm.

Two packages have **Flavors** — a per-Runtime subpath over a shared core:
`@monorepo/env` (`./vite/*`, `./next/*`) and `@monorepo/i18n` (`./i18next/*`, `./next-intl/*`),
with the language registry and the ICU message catalogue shared by both
([ADR-0002](./docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md)).

## `legacy/`

Six apps and two published packages from before the rebuild live in [`legacy/`](./legacy/),
**outside** `workspaces.packages` — `bun install`, `turbo run` and `biome check` never reach them
([ADR-0001](./docs/adr/0001-legacy-apps-outside-workspace.md)). Git history is intact and each one
still runs from inside its own directory on the toolchain it was written against, but nothing there
is maintained.

Each comes back into `apps/` through its own migrate ticket, cloned onto the Template app for its
Runtime. [`legacy/README.md`](./legacy/README.md) has the app → Runtime → target Template table and
the list of things that no longer exist at the root (pnpm, ESLint, Prettier, rslib, changesets).

## Working with agents

- [`CLAUDE.md`](./CLAUDE.md) — the structure, the data flow, and where to put what
- [`.agents/rules/`](./.agents/rules/) — the engineering rules, indexed in
  [`.agents/README.md`](./.agents/README.md)
- [`.agents/skills/`](./.agents/skills/) — vendored skills; the 25 installed by the `skills` CLI
  are pinned in [`skills-lock.json`](./skills-lock.json), the six `gitnexus-*` are owned by
  `gitnexus analyze`
- [`.agents/plans/`](./.agents/plans/) — the issue tracker: markdown, in-repo, one folder per topic
  ([`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md))
- [`.mcp.json`](./.mcp.json) — Context7 and GitNexus at project scope
