# Storybook — UI preview (`@monorepo/ui`)

Interactive Storybook for the shared UI package, built with **Vite** and `@storybook/react-vite`.

## Overview

- **Source**: `apps/storybook/`
- **Stories**: co-located under `packages/ui/src/stories/` (and related UI source)
- **Introduction page**: `apps/storybook/src/introduction.stories.tsx`

## Development

From the monorepo root:

```bash
pnpm dev:storybook
```

Or from `apps/storybook`:

```bash
pnpm dev
```

Default port is **6006** (Storybook will prompt for another port if it is busy).

## Environment variables

Storybook loads the **monorepo root** `.env` (see `apps/storybook/vite.config.ts` → `envDir`). Public client variables must use the **`VITE_`** prefix.

In application code, use the shared validator — do **not** read `import.meta.env` directly in feature/story source:

```ts
import { env } from "@monorepo/env/vite";

const docsUrl = env.VITE_DOCUMENTS_DOMAIN;
```

Relevant keys (optional):

- `VITE_DOCUMENTS_DOMAIN` — public URL of the Documents site
- `VITE_STORYBOOK_DOMAIN` — public URL of this Storybook deployment
- `VITE_SKIP_ENV_VALIDATION` — set to `true` to skip env validation when needed locally

Details: [`@monorepo/env` README](../../packages/env/README.md).

## Build and preview

```bash
# From root (via turbo) or apps/storybook
pnpm build
pnpm preview   # Vite preview of static output
```

Static export output directory is configured as `storybook-static` (see `vite.config.ts`).

## Deployment

- **Vercel**: `apps/storybook/vercel.json` — install from repo root, build via Turbo, output `storybook-static`.
- **Manual deploy hook**: see [Vercel manual deploy](../others/VERCEL-DEPLOY.md) and secret `VERCEL_DEPLOY_HOOK_STORYBOOK`.

## Related documentation

- [Documents](./DOCUMENTS.md) — documentation site for components and hooks
- [Vercel deploy](../others/VERCEL-DEPLOY.md) — manual deploy hooks
- [Main README](../../README.md) — monorepo overview
