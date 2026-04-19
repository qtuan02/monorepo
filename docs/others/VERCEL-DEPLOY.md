# Manual Vercel deploy (GitHub Actions)

This monorepo uses a **manual** workflow to trigger production builds on Vercel via [Deploy Hooks](https://vercel.com/docs/deploy-hooks), instead of relying on every push to `main`.

Workflow file: [`.github/workflows/deploy-vercel-manual.yml`](../../.github/workflows/deploy-vercel-manual.yml).

## Prerequisites

### 1. Vercel — Deploy Hook (per project)

For each Vercel project (Storybook, Portfolio, Documents, Assistant AI, MCP):

1. Open the project on Vercel → **Settings** → **Git** → **Deploy Hooks**.
2. Create a hook for the branch you use for production (e.g. `main`).
3. Copy the full hook URL (HTTPS).

### 2. GitHub — repository secrets

In the GitHub repo: **Settings** → **Secrets and variables** → **Actions**, add **one secret per app** (full hook URL):

| Secret                            | App                 |
| --------------------------------- | ------------------- |
| `VERCEL_DEPLOY_HOOK_STORYBOOK`    | `apps/storybook`    |
| `VERCEL_DEPLOY_HOOK_PORTFOLIO`    | `apps/portfolio`    |
| `VERCEL_DEPLOY_HOOK_DOCUMENTS`    | `apps/documents`    |
| `VERCEL_DEPLOY_HOOK_ASSISTANT_AI` | `apps/assistant-ai` |
| `VERCEL_DEPLOY_HOOK_MCP`          | `apps/mcp`          |

If a secret is missing, the workflow exits with a clear error for that app.

### 3. Optional — disable automatic Production deploys

If you **only** want production deploys from this workflow, disable automatic Production deployments on each Vercel project (**Settings** → **Git**), or restrict which branches trigger deploys.

## How to run

1. GitHub → **Actions** → **Manual Vercel deploy**.
2. **Run workflow** → choose **app** → **Run workflow**.

The job sends `POST` to the hook URL; Vercel pulls the latest commit from the connected branch and runs that project’s **Build Command** (see each app’s `vercel.json` / dashboard).

## Environment variables on Vercel

Set variables in the **Vercel project** (or link from a team env), not only in local `.env`.

- **Documents** and **Storybook** (Vite): expose client vars with the `VITE_` prefix, e.g. `VITE_DOCUMENTS_DOMAIN`, `VITE_STORYBOOK_DOMAIN`. They are validated in app code via [`@monorepo/env/vite`](../../packages/env/README.md) and loaded from the monorepo root in dev (`envDir` in `vite.config.ts`).
- **Next.js** apps: use `NEXT_PUBLIC_*` and server secrets as documented per app.

See also: [Documents guide](../apps/DOCUMENTS.md), [Storybook guide](../apps/STORYBOOK.md), [`@monorepo/env`](../../packages/env/README.md).

## Troubleshooting

| Issue                                    | What to check                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Workflow fails: “Missing secret for app” | Add the matching `VERCEL_DEPLOY_HOOK_*` secret with the full hook URL.                                       |
| Hook runs but build fails                | Open the deployment in Vercel → **Building** logs; fix install/build (often `turbo run build --filter=...`). |
| Wrong revision deployed                  | Confirm the Git integration branch matches the hook branch; push latest to that branch before triggering.    |
