# @monorepo/storybook

Storybook (Vite) for **`@monorepo/ui`** — component stories and introduction page.

**Full guide:** [docs/apps/STORYBOOK.md](../../docs/apps/STORYBOOK.md)

## Quick start

```bash
# From monorepo root
pnpm dev:storybook
```

Default URL: **http://localhost:6006**

## Environment

Optional `VITE_*` variables are read from the **monorepo root** `.env`. Use `import { env } from "@monorepo/env/vite"` in app/story code — see [`@monorepo/env`](../../packages/env/README.md).
