# Template Application

This is the standard template for creating new Next.js applications in the monorepo. All new apps should follow this structure and patterns.

## Overview

This template provides a production-ready Next.js 15 application with:

- **Next.js 15** with App Router
- **React 19** with Server Components
- **TypeScript** for type safety
- **Internationalization (i18n)** with `next-intl`
- **Tailwind CSS v4** for styling
- **shadcn/ui** components from `@monorepo/ui`
- **Sentry** for error tracking and performance monitoring
- **TanStack Query** for data fetching
- **Sonner** for toast notifications

## Project Structure

```
_template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── layout.tsx     # Root layout with providers
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── error.tsx      # Error boundary
│   │   │   ├── not-found.tsx # 404 page
│   │   │   └── provider.tsx  # Client-side providers
│   │   ├── api/               # API routes
│   │   ├── global-error.tsx   # Global error handler
│   │   ├── layout.tsx         # Root layout
│   │   ├── manifest.ts        # PWA manifest
│   │   ├── robot.ts           # robots.txt
│   │   └── sitemap.xml/       # Sitemap generation
│   ├── components/            # React components
│   │   ├── button/            # Example component
│   │   └── exception/        # Error/404 components
│   ├── constants/            # App constants
│   ├── features/             # Feature modules (export here)
│   ├── hooks/                # Custom React hooks
│   │   └── api/              # API-related hooks
│   ├── i18n/                 # Internationalization config
│   ├── icons/                # Icon type definitions
│   ├── libs/                 # Library configurations
│   ├── stores/               # State management stores
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── messages/                 # i18n translation files
│   ├── en.json
│   ├── vi.json
│   └── vi.d.json.ts          # Type definitions
├── public/                   # Static assets
├── Dockerfile                # Docker configuration
├── next.config.js            # Next.js configuration
├── eslint.config.ts          # ESLint configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies

```

## Getting Started

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0

### Installation

1. Copy this template to create a new app:

   ```bash
   cp -r apps/_template apps/your-app-name
   ```

2. Update `package.json`:
   - Change `name` to `@monorepo/your-app-name`
   - Update any app-specific dependencies

3. Update configuration files:
   - `next.config.js`: Update Sentry project name
   - `sentry.server.config.ts`: Update Sentry project name
   - `sentry.edge.config.ts`: Update Sentry project name
   - `src/constants/common.ts`: Update `LOCALE_COOKIE_NAME`

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Set up environment variables:
   - Copy `.env.template` from root (if exists)
   - Configure required environment variables

6. Run development server:
   ```bash
   pnpm dev
   ```

## Dependencies

### Core Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `next-intl` - Internationalization
- `@monorepo/ui` - Shared UI components
- `@monorepo/sentry` - Sentry integration
- `@monorepo/env` - Environment variable management
- `@tanstack/react-query` - Data fetching
- `sonner` - Toast notifications

### Development Dependencies

- `typescript` - TypeScript compiler
- `eslint` - Linting
- `prettier` - Code formatting
- `@monorepo/eslint-config` - Shared ESLint config
- `@monorepo/prettier-config` - Shared Prettier config
- `@monorepo/tailwind-config` - Shared Tailwind config
- `@monorepo/tsconfig` - Shared TypeScript config

## Key Features

### Internationalization (i18n)

The template uses `next-intl` for internationalization:

- Supported locales: `en`, `vi`
- Default locale: `en`
- Translation files in `messages/` directory
- Type-safe translations with generated types

**Usage:**

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("Namespace");
  return <p>{t("key")}</p>;
}
```

### Server Components

By default, all components are Server Components. Use `'use client'` directive only when necessary:

- Accessing browser APIs
- Using React hooks (useState, useEffect, etc.)
- Event handlers
- Third-party client-only libraries

### Error Handling

- `error.tsx` - Route-level error boundary
- `global-error.tsx` - Global error handler
- `not-found.tsx` - 404 page
- Sentry integration for error tracking

### Data Fetching

Use TanStack Query for data fetching:

```tsx
import { useQuery } from "@tanstack/react-query";

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ["key"],
    queryFn: fetchData,
  });
  // ...
}
```

### Styling

- Tailwind CSS v4 for utility-first styling
- shadcn/ui components from `@monorepo/ui`
- Responsive design with mobile-first approach

## Best Practices

### Code Organization

1. **Server Components First**: Prefer Server Components over Client Components
2. **Feature-based Structure**: Organize code by features in `src/features/`
3. **Shared Code**: Use `packages/` for reusable code
4. **Type Safety**: Always use TypeScript types, avoid `any`

### Performance

1. **Minimize Client JavaScript**: Use Server Components when possible
2. **Lazy Loading**: Use `next/dynamic` for code splitting
3. **Image Optimization**: Use `next/image` for images
4. **Static Generation**: Use `generateStaticParams` when possible

### Security

1. **Environment Variables**: Use `@monorepo/env` for type-safe env vars
2. **API Routes**: Validate input with Zod
3. **Error Handling**: Don't expose sensitive information in errors

## Docker

Build and run with Docker:

```bash
# Build
docker build -f apps/_template/Dockerfile -t template:local \
  --build-arg PROJECT=@monorepo/_template \
  --build-arg APP_DIRNAME=_template \
  --build-arg NODE_ENV=dockerfile .

# Run
docker run --rm -p 3000:3000 template:local
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier

## Environment Variables

Required environment variables (configure in root `.env`):

- `NEXT_PUBLIC_ENV` - Environment (local, development, production)
- Sentry variables (configured via `@monorepo/sentry`)

## Customization

When creating a new app from this template:

1. Update app name in all config files
2. Customize `src/app/[locale]/page.tsx`
3. Add your features to `src/features/`
4. Update translation files in `messages/`
5. Configure Sentry project
6. Update metadata in `get-metadata-default.ts`
7. Customize `manifest.ts` for PWA

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For questions or issues, refer to:

- Monorepo root `README.md`
- Cursor rules in `.cursor/rules/`
- Package documentation in `docs/`
