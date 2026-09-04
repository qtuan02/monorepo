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
| `portfolio/` | `apps/portfolio` | Next.js | **migrated** — it is [`apps/portfolio`](../apps/portfolio) again, cloned onto `apps/_template_next` in [ticket 03](../.agents/plans/legacy-migrate/03-migrate-portfolio-env-convention.md). This directory is kept for comparison only, and goes with the rest at ticket 07 |
| `assistant-ai/` | `apps/assistant-ai` | Next.js | **migrated** — it is [`apps/assistant-ai`](../apps/assistant-ai) again, cloned onto `apps/_template_next` in [ticket 05](../.agents/plans/legacy-migrate/05-migrate-assistant-ai.md), with the whole AI SDK stack taken to latest (`ai` 7, `@ai-sdk/google` 4, `@assistant-ui/react` 0.15) and no Radix dependency of its own. It calls `apps/mcp-weather` through `MCP_DOMAIN`. Kept for comparison only, deleted at ticket 07 |
| `mcp/` | `apps/mcp` | Next.js | **migrated** — it came back under a new name, [`apps/mcp-weather`](../apps/mcp-weather), cloned onto `apps/_template_next` in [ticket 04](../.agents/plans/legacy-migrate/04-migrate-mcp-weather.md). The MCP contract is unchanged (`POST /api/mcp`, three tools, no auth), so a client already calling it needs no edit. Kept for comparison only, deleted at ticket 07 |
| `documents/` | `apps/documents` | Vite client (SPA) | **migrated** — it is [`apps/documents`](../apps/documents) again, cloned onto `apps/_template_vite` in [ticket 06](../.agents/plans/legacy-migrate/06-migrate-documents-metadata-script.md). Its content is now generated from `packages/{ui,hook}/src` rather than hand-written, so nothing here is a source. Kept for comparison only, deleted at ticket 07 |
| `storybook/` | `apps/storybook` — Storybook 8.6 on Radix | Vite client | rebuilt from scratch as `apps/storybook` (Storybook 10 + Base UI); stories are re-authored, not ported |
| `ui-public/` | `packages/ui-public` — `@fe-monorepo/ui`, rslib build, published to npm | — | the source lives on as `packages/ui` (`@monorepo/ui`, source-only, Base UI) — that is what every app in this repo imports. Publishing came **back**, in a different shape: [ADR-0004](../docs/adr/0004-npm-publish-qua-publish-shell.md) recreates `packages/ui-public` at the root as a **Publish shell** — a hand-written `package.json` fed by an rslib `build` of `packages/ui`, and one of the only two workspaces Changesets versions and `npm publish`es. Written fresh; nothing from this directory is restored |
| `hook-public/` | `packages/hook-public` — `@fe-monorepo/hook`, published to npm | — | same story: the source is `packages/hook` (source-only), and `packages/hook-public` is recreated at the root as the second **Publish shell** per [ADR-0004](../docs/adr/0004-npm-publish-qua-publish-shell.md). The npm names stay `@fe-monorepo/*` while the workspace names are `@monorepo/*` (decision 4) — deliberately two different names |
| `.changeset/` | root `.changeset` | — | dead weight, and not the archive it was once described as: it holds only `README.md` and `config.json`. There is **no changelog and no release history in here** — `find legacy -iname "CHANGELOG*"` returns nothing; the published history lives on npm and in git. Changesets does come back at the root, but configured from scratch for the two Publish shells per [ADR-0004](../docs/adr/0004-npm-publish-qua-publish-shell.md), not copied from this config |
| `docs/` | root `docs/{README.md,apps,others,packages}` — guides for the apps above | — | rewritten per app as it migrates; `docs/` at the root is now ADRs, agent docs and research |
| `.env` (untracked) | root `.env` — the values these apps were last run with | — | the root `.env` now follows `.env.example`; this copy stays so a legacy app can still be booted |

All of this is read-only history, and it has an end date: **ticket 07 of the `legacy-migrate` topic**
([`07-delete-legacy.md`](../.agents/plans/legacy-migrate/07-delete-legacy.md)) deletes this whole
directory — README included — once the four apps above have landed in `apps/`. **All four are
there**: `portfolio/` (ticket 03), `mcp/` — now `apps/mcp-weather` — (ticket 04),
`assistant-ai/` (ticket 05) and `documents/` (ticket 06), so ticket 07 is what the date now waits
on rather than any further migration. Three further rows are superseded rather than merely waiting: `ui-public/`,
`hook-public/` and `.changeset/` have live replacements at the root today, written fresh against the
current surface per ADR-0004, so nothing in those three directories is a source for anything any more.

## Things that no longer exist at the root

Migrating an app means dropping these, not restoring them:

- **pnpm** — `pnpm-lock.yaml`, `pnpm-workspace.yaml` (its `catalog:`/`catalogs:`
  moved into `package.json` `workspaces`), `.npmrc`.
- **ESLint + Prettier** — `toolings/eslint`, `toolings/prettier` and every
  per-package `eslint.config.ts` / `prettier` key. Biome does all three jobs now
  (decision 12).
- **rslib + changesets in the shape they had here.** Every package an app
  imports is still source-only, `private`, and exports subpaths straight out of
  `src/` (decision 3) — that holds for `packages/ui` and `packages/hook` too,
  whose `build` output no app in this repo ever reads. What came back is
  narrower and lives elsewhere: per
  [ADR-0004](../docs/adr/0004-npm-publish-qua-publish-shell.md), those two
  packages — and only those two — now carry an rslib `build` (bundleless,
  per-file ESM + `.d.ts`) that fills the `dist/` of a Publish shell, and
  Changesets versions the two shells rather than any package here. Migrating an
  app gives it neither a build step nor a changeset, and restores nothing from
  this tree.
- **`packages/{env,hook,ui,sentry}`** as they were: rebuilt from the reference
  shape in tickets 02–05 rather than moved here. Read them at commit `7edc303`
  (`git show 7edc303:packages/ui/package.json`) if a detail is needed.
