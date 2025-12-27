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

## 🚀 Live Demo

**Coming Soon** - Deployed on Vercel

## ✨ Features

### Core Features

- ✅ **Auto-generated Documentation** - Extracts metadata from TypeScript using ts-morph
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

### Code Processing

- **ts-morph** - TypeScript AST manipulation for metadata extraction
- **React** - Component rendering for previews

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
│   ├── generated/               # Auto-generated files
│   │   ├── components.json     # Component metadata
│   │   ├── hooks.json          # Hook metadata
│   │   ├── registry.tsx        # Component registry
│   │   └── index.ts            # Exports
│   │
│   ├── app.tsx                  # Main app with routes
│   ├── main.tsx                 # Entry point
│   └── globals.css              # Global styles
│
├── scripts/
│   └── generate-metadata.ts     # Metadata generation script
│
├── tests/                       # Test files
├── docs/                        # Empty (future use)
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

```bash
# From monorepo root
cd apps/documents
pnpm install
```

### Development

```bash
# Generate metadata and start dev server
pnpm dev

# The app will be available at http://localhost:5173
```

### Build

```bash
# Generate metadata and build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## 📖 How It Works

### 1. Metadata Generation

The `generate-metadata.ts` script:

1. Scans `packages/ui/src/components/**/*.tsx`
2. Scans `packages/hook/src/hooks/**/*.ts`
3. Uses `ts-morph` to extract TypeScript metadata
4. Generates JSON files with component/hook metadata
5. Creates `registry.tsx` for component previews

```bash
# Manually run metadata generation
pnpm generate:docs
```

### 2. Documentation Display

The app:

1. Loads metadata from JSON files
2. Renders component previews from `registry.tsx`
3. Displays props tables from extracted TypeScript interfaces
4. Shows source code with syntax highlighting
5. Provides search across all metadata

### 3. Routing

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

## 🚀 Deployment

### Vercel (Recommended)

The app is configured for Vercel deployment:

1. **Build Command**: `pnpm build`
2. **Output Directory**: `dist`
3. **Framework**: Vite
4. **Rewrites**: Configured for SPA routing

```bash
# Vercel will automatically:
# 1. Install dependencies
# 2. Run pnpm generate:docs
# 3. Build with Vite
# 4. Deploy to CDN
```

### Environment Variables

No environment variables required for basic operation.

## 🔧 Configuration

### Vite Configuration

```typescript
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": "/src",
    },
  },
});
```

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

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Routes Return 404

Ensure `vercel.json` has the rewrites configuration for SPA routing.

### Metadata Not Updating

```bash
# Manually regenerate metadata
pnpm generate:docs
```

### Component Previews Not Showing

Check that components are exported in `registry.tsx`.

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

### Adding New Components

1. Create component in `packages/ui/src/components/`
2. Add TypeScript interfaces for props
3. Run `pnpm generate:docs` to update metadata
4. Component will automatically appear in docs

### Adding New Hooks

1. Create hook in `packages/hook/src/hooks/`
2. Add JSDoc comments for documentation
3. Run `pnpm generate:docs` to update metadata
4. Hook will automatically appear in docs

## 📄 Related Documentation

- [Main README](../../README.md) - Monorepo overview
- [BMAD Workflow](../../docs/bmad/brief.md) - Project brief and workflow
- [UI Package](../../packages/ui/README.md) - UI component library
- [Hook Package](../../packages/hook/README.md) - React hooks library

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review the [BMAD Guide](../../docs/others/BMAD-GUIDE.md)
3. Contact the maintainer

---

**Status**: ✅ Live in Production  
**Last Updated**: December 2025  
**Version**: 1.0.0
