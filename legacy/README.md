# `legacy/` — frozen until migrated

Everything here predates the Skeleton rebuild. The directory is **outside**
`workspaces.packages` in the root `package.json`, so `bun install`,
`turbo run …` and `biome check .` never reach it (see
[ADR-0001](../docs/adr/0001-legacy-apps-outside-workspace.md)). Git history is
intact; nothing else about these trees is maintained.

Each app comes back into `apps/` through its own migrate ticket, cloned onto the
Template app for its Runtime and then re-populated with its business code. Until
then an app only runs from inside its own directory with the toolchain it was
written against (pnpm 10 + Node 22), and its dependencies are no longer resolved
by the root install.

## What is here, and where it goes

| `legacy/` | Was | Runtime | Target Template |
| --- | --- | --- | --- |
| `_template/` | `apps/_template` — the old Next 15 starter every app was hand-copied from | Next.js | superseded by `apps/_template_next`; migrate nothing, delete once the other four are done |
| `portfolio/` | `apps/portfolio` | Next.js | `apps/_template_next` |
| `assistant-ai/` | `apps/assistant-ai` | Next.js | `apps/_template_next` |
| `mcp/` | `apps/mcp` | Next.js | `apps/_template_next` |
| `documents/` | `apps/documents` | Vite client (SPA) | `apps/_template_vite` |
| `storybook/` | `apps/storybook` — Storybook 8.6 on Radix | Vite client | rebuilt from scratch as `apps/storybook` (Storybook 10 + Base UI); stories are re-authored, not ported |
| `ui-public/` | `packages/ui-public` — `@fe-monorepo/ui`, rslib build, published to npm | — | folded into `packages/ui` (`@monorepo/ui`, source-only, Base UI). Publishing is dropped, see decision 3 |
| `hook-public/` | `packages/hook-public` — `@fe-monorepo/hook`, published to npm | — | folded into `packages/hook` (source-only) |
| `.changeset/` | root `.changeset` | — | nothing publishes any more; kept only so the release history is readable |
| `docs/` | root `docs/{README.md,apps,others,packages}` — guides for the apps above | — | rewritten per app as it migrates; `docs/` at the root is now ADRs, agent docs and research |
| `.env` (untracked) | root `.env` — the values these apps were last run with | — | the root `.env` now follows `.env.example`; this copy stays so a legacy app can still be booted |

## Things that no longer exist at the root

Migrating an app means dropping these, not restoring them:

- **pnpm** — `pnpm-lock.yaml`, `pnpm-workspace.yaml` (its `catalog:`/`catalogs:`
  moved into `package.json` `workspaces`), `.npmrc`.
- **ESLint + Prettier** — `toolings/eslint`, `toolings/prettier` and every
  per-package `eslint.config.ts` / `prettier` key. Biome does all three jobs now
  (decision 12).
- **rslib + changesets** — packages are source-only, `private`, and export
  subpaths straight out of `src/` (decision 3).
- **`packages/{env,hook,ui,sentry}`** as they were: rebuilt from the reference
  shape in tickets 02–05 rather than moved here. Read them at commit `7edc303`
  (`git show 7edc303:packages/ui/package.json`) if a detail is needed.
