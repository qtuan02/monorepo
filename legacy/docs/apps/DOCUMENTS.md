# Documents - UI Documentation Site

A comprehensive documentation site for all UI components and React hooks in the monorepo, built with Vite, React 19, and TypeScript.

## 🎯 Overview

The Documents application automatically generates documentation from TypeScript source code, providing:

- **Visual previews** of UI components with live examples
- **Auto-generated props tables** from TypeScript interfaces
- **Source code viewer** with syntax highlighting
- **Hook documentation** with parameters and usage examples
- **Search functionality** for quick discovery
- **Dark/Light theme** support

## Live site

**[documents-ui.vercel.app](https://documents-ui.vercel.app)** (Vercel)

## ✨ Features

### Core Features

- ✅ **Structured documentation** — Metadata from `src/constants/*.json` and the preview registry
- ✅ **Component Previews** - Live rendering of components with examples
- ✅ **Props Tables** - Automatically generated from TypeScript interfaces
- ✅ **Source Code Display** - Syntax-highlighted code viewer
- ✅ **Hook Documentation** - Parameters, return values, and usage examples
- ✅ **Search** - Fast search across all components and hooks
- ✅ **Theme Switcher** - Dark/Light mode with persistent preferences
- ✅ **Mobile Responsive** - Optimized for all screen sizes

### Documentation Coverage

- **Components**: All components from `packages/ui/src/components/*`
- **Hooks**: All hooks from `packages/hook/src/hooks/*`
- **Exclusions**: Legacy `/v1/*` components and hooks

### Navigation

- **Category-based Navigation** - Components organized under "shadcn" parent
- **Flat Hook Listing** - Simple, easy-to-browse hook list
- **Breadcrumbs** - Clear navigation context
- **Sidebar** - Collapsible navigation sidebar
- **Package Filters** - Filter by UI components or Hooks

## 🛠️ Tech Stack

### Core

- **Vite** - Fast build tool and dev server
- **React 19** - Latest React with React Compiler
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing

### UI & Styling

- **shadcn/ui** - Component library for dashboard layout
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Data & previews

- **Static metadata** — `components.json` / `hooks.json` under `src/constants/` (see [How metadata is loaded](#how-metadata-is-loaded))
- **React** — Component rendering for previews

### Testing

- **Vitest** - Unit testing framework
- **@testing-library/react** - React component testing
- **jsdom** - DOM implementation for Node.js

## 📁 Project Structure

```
apps/documents/
├── src/
│   ├── components/              # UI components
│   │   ├── app-layout.tsx      # Main layout with sidebar
│   │   ├── breadcrumb.tsx      # Navigation breadcrumbs
│   │   ├── category-sidebar.tsx # Category navigation
│   │   ├── code-viewer.tsx     # Code display component
│   │   ├── component-card.tsx  # Component grid card
│   │   ├── component-detail.tsx # Component detail view
│   │   ├── hook-card.tsx       # Hook grid card
│   │   ├── hook-detail.tsx     # Hook detail view
│   │   ├── navigation-sidebar.tsx # Main navigation
│   │   ├── search-bar.tsx      # Search input
│   │   ├── search-modal.tsx    # Search modal dialog
│   │   ├── theme-switcher.tsx  # Theme toggle
│   │   └── ...
│   │
│   ├── pages/                   # Page components
│   │   ├── home-page.tsx       # Landing page
│   │   ├── all-components-page.tsx # Components listing
│   │   ├── all-hooks-page.tsx  # Hooks listing
│   │   ├── component-detail-page.tsx # Component details
│   │   └── hook-detail-page.tsx # Hook details
│   │
│   ├── lib/                     # Utilities
│   │   ├── category-utils.ts   # Component categorization
│   │   ├── hook-category-utils.ts # Hook categorization
│   │   ├── search-utils.ts     # Search functionality
│   │   ├── theme-utils.ts      # Theme management
│   │   ├── use-component-metadata.ts # Component data hook
│   │   ├── use-hook-metadata.ts # Hook data hook
│   │   └── use-search.ts       # Search hook
│   │
│   ├── contexts/                # React contexts
│   │   └── theme-context.tsx   # Theme provider
│   │
│   ├── constants/               # Metadata & registry
│   │   ├── components.json     # Component metadata
│   │   ├── hooks.json            # Hook metadata
│   │   ├── registry.tsx          # Component preview registry
│   │   └── index.ts              # Re-exports
│   │
│   ├── app.tsx                  # Main app with routes
│   ├── main.tsx                 # Entry point
│   └── globals.css              # Global styles
│
├── tests/                       # Test files
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest configuration
├── vercel.json                  # Vercel deployment config
└── package.json
```

## 🚦 Getting Started

### Prerequisites

```bash
# Node.js >=22.21.0
# pnpm >=10.19.0
```

### Installation

From the **monorepo root** (recommended):

```bash
pnpm install
```

### Development

```bash
# From monorepo root
pnpm dev:documents
```

Or from `apps/documents`:

```bash
pnpm dev
```

Dev server runs on **port 3000** by default (`vite.config.ts`). The app reads env from the **repo root** `.env` (`envDir`).

### Build

```bash
# From root (matches Vercel / turbo)
pnpm exec turbo run build --filter=@monorepo/documents
```

Or from `apps/documents`:

```bash
pnpm build
pnpm preview
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## How it works

### How metadata is loaded

Component and hook listings come from **`src/constants/components.json`** and **`src/constants/hooks.json`**, plus **`registry.tsx`** for preview wiring. Update those files when you add or change documented entries, and keep previews in sync with `packages/ui` / `packages/hook` as needed.

### Documentation display

The app:

1. Loads metadata from the JSON files above
2. Renders component previews via `registry.tsx`
3. Shows props tables, source, and search over that data

### Routing

SPA routing handled by React Router with Vercel rewrites:

```
/                    → Home page
/components          → All components listing
/components/:id      → Component detail page
/hooks               → All hooks listing
/hooks/:id           → Hook detail page
```

**Important**: `vercel.json` contains rewrites to handle client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🎨 Theme Support

The app supports Dark/Light themes using React Context:

```typescript
// Usage in components
import { useTheme } from "~/contexts/theme-context";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  // theme: 'light' | 'dark' | 'system'
}
```

Theme preference is persisted in localStorage.

## 📝 Testing Strategy

Tests are written using Vitest and Testing Library:

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch
```

Test coverage includes:

- Component rendering
- Search functionality
- Theme switching
- Routing behavior

## Deployment

### Vercel

`apps/documents/vercel.json` is set up for a **monorepo** install and **Turbo** build:

- **Install**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build**: `cd ../.. && pnpm exec turbo run build --filter=@monorepo/documents`
- **Output**: `dist`
- **Framework**: Vite (SPA rewrites to `index.html`)

Manual production deploys via GitHub Actions + deploy hooks are documented in [Vercel manual deploy](../others/VERCEL-DEPLOY.md).

### Environment variables

The UI works without extra env. For **cross-links** (home page) to public URLs, set optional **`VITE_`** variables in the **monorepo root** `.env` (and on the Vercel project):

- `VITE_DOCUMENTS_DOMAIN`
- `VITE_STORYBOOK_DOMAIN`

Use the shared package in code — do **not** read `import.meta.env` in app source:

```ts
import { env } from "@monorepo/env/vite";

// env.VITE_DOCUMENTS_DOMAIN, env.VITE_STORYBOOK_DOMAIN
```

See [`@monorepo/env`](../../packages/env/README.md).

## 🔧 Configuration

### Vite configuration

`envDir` points at the **monorepo root** so `.env` is shared; only `VITE_*` keys are exposed to the client (`envPrefix`).

```typescript
// apps/documents/vite.config.ts (excerpt)
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: path.resolve(__dirname, "../.."),
  envPrefix: "VITE_",
  plugins: [react()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  server: { port: 3000 },
});
```

**Scripts note:** `package.json` runs Vite/Vitest via `node ../../node_modules/...` so the CLI always resolves from the **workspace root** `node_modules` (avoids broken local `node_modules/.bin` shims under `pnpm` + `node-linker=hoisted` on Windows).

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "@monorepo/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

## 📚 API Reference

### Hooks

#### `useComponentMetadata(id?: string)`

Fetch component metadata by ID or all components.

```typescript
const { component, loading, error } = useComponentMetadata("button");
```

#### `useHookMetadata(id?: string)`

Fetch hook metadata by ID or all hooks.

```typescript
const { hook, loading, error } = useHookMetadata("use-media-query");
```

#### `useSearch()`

Search across components and hooks.

```typescript
const { search, results, isSearching } = useSearch();
```

## 🎯 Component Categories

Components are organized into categories:

- **Form** - Input, Select, Checkbox, etc.
- **Layout** - Card, Container, Grid, etc.
- **Feedback** - Alert, Toast, Dialog, etc.
- **Data Display** - Table, List, Badge, etc.
- **Navigation** - Tabs, Menu, Breadcrumb, etc.

## Troubleshooting

### `Cannot find module '...\node_modules\vite\bin\vite.js'` when running `pnpm dev`

Usually a **broken local** `apps/documents/node_modules` (e.g. `.bin/vite` without a `vite` package). From the repo root:

```bash
# Remove the app’s node_modules only, then reinstall
Remove-Item -Recurse -Force apps/documents/node_modules   # PowerShell
pnpm install
```

Scripts intentionally call Vite/Vitest from **`../../node_modules/...`** to avoid relying on a broken shim.

### Build fails

```bash
pnpm install
pnpm exec turbo run build --filter=@monorepo/documents
```

### Routes return 404 on Vercel

Ensure `vercel.json` has SPA rewrites to `/index.html` (see [Routing](#routing)).

### Metadata not updating

Edit `src/constants/components.json`, `hooks.json`, and `registry.tsx` as needed; there is no separate `generate:docs` script in this app today.

### Component previews not showing

Confirm the component is registered in `registry.tsx` and listed in `components.json`.

## 📈 Future Enhancements

Potential future features (out of current scope):

- [ ] Interactive component playground
- [ ] User authentication with better-auth
- [ ] Advanced search with full-text indexing
- [ ] Versioning system
- [ ] Custom examples editor
- [ ] AI-powered component suggestions
- [ ] Visual component builder
- [ ] Component usage analytics

## 🤝 Contributing

### Adding new components

1. Add or update the component in `packages/ui/src/components/`
2. Update `src/constants/components.json` and `src/constants/registry.tsx` (and previews as needed)

### Adding new hooks

1. Add or update the hook in `packages/hook/src/hooks/`
2. Update `src/constants/hooks.json` and any preview wiring

## Related documentation

- [Main README](../../README.md) — Monorepo overview
- [Storybook](./STORYBOOK.md) — UI Storybook
- [Vercel manual deploy](../others/VERCEL-DEPLOY.md) — Deploy hooks & env on Vercel
- [`@monorepo/env`](../../packages/env/README.md) — Environment validation
- [UI Package](../../packages/ui/README.md) — UI component library
- [Hook Package](../../packages/hook/README.md) — React hooks library

---

**Last updated**: April 2026
