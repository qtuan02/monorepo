# Portfolio v1 Application

Portfolio application v1 built with Next.js 15, featuring documentation, about page, and interactive UI components.

## Overview

This is a portfolio application that showcases:

- **Documentation System**: Comprehensive docs with code examples and live previews
- **About Page**: Personal information, skills, and experience
- **Home Page**: Landing page with animations
- **Internationalization**: Multi-language support (English, Vietnamese)
- **Theme Support**: Light and dark mode
- **Component Library**: Interactive UI components with examples

## Features

### Documentation System

The app includes a full documentation system (`/docs`) with:

- Component documentation with live previews
- Code examples with syntax highlighting
- Animation examples
- Hook examples
- Interactive demos

### Pages

- **Home** (`/`): Landing page with animations
- **About** (`/about`): Personal information and experience
- **Docs** (`/docs`): Component and feature documentation

### Key Features

- **Rate Limiting**: API rate limiting for protection
- **Sitemap Generation**: Dynamic sitemap generation
- **Infinite Scroll**: Custom hook for infinite scrolling
- **Syntax Highlighting**: Code block rendering with Prism
- **Form Handling**: React Hook Form integration
- **Error Boundaries**: Error handling with react-error-boundary

## Project Structure

```
_portfolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── about/         # About page
│   │   │   ├── docs/          # Documentation pages
│   │   │   └── [...rest]/     # Catch-all routes
│   │   └── api/               # API routes
│   │       ├── rate-limit/    # Rate limiting endpoint
│   │       └── sitemaps/      # Sitemap generation
│   ├── components/            # Shared components
│   │   ├── exception/         # Error/404 components
│   │   ├── next-image/        # Image wrapper
│   │   └── next-link/         # Link wrapper
│   ├── features/              # Feature modules
│   │   ├── about/             # About page feature
│   │   ├── docs/              # Documentation feature
│   │   ├── home/              # Home page feature
│   │   └── layout/            # Layout components (navbar, footer)
│   ├── hooks/                 # Custom React hooks
│   │   └── use-infinite-scroll.ts
│   ├── utils/                 # Utility functions
│   │   ├── rate-limit.ts      # Rate limiting utility
│   │   └── sitemap/           # Sitemap utilities
│   └── ...                    # Other standard directories
└── messages/                  # i18n translation files
```

## Dependencies

### Additional Dependencies (beyond template)

- `@hookform/resolvers` - Form validation resolvers
- `react-hook-form` - Form management
- `cookies-next` - Cookie management
- `lru-cache` - LRU cache for rate limiting
- `react-error-boundary` - Error boundary component
- `react-syntax-highlighter` - Code syntax highlighting
- `flag-icons` - Country flag icons
- `next-themes` - Theme management
- `@tanstack/react-query` - Data fetching
- `@tanstack/react-query-devtools` - Query devtools

## Key Components

### Documentation System

The docs feature (`src/features/docs/`) includes:

- **Component Documentation**: UI components with examples
- **Animation Examples**: Various animation effects
- **Hook Examples**: Custom hooks with demos
- **Code Blocks**: Syntax-highlighted code examples
- **Live Previews**: Interactive component previews

### Rate Limiting

API rate limiting is implemented using LRU cache:

```typescript
// src/utils/rate-limit.ts
import { LRUCache } from "lru-cache";

// Rate limit configuration
const rateLimit = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});
```

### Sitemap Generation

Dynamic sitemap generation for:

- Common pages
- About pages
- Documentation pages
- Nested documentation routes

## Development

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables (see root `.env`)

3. Run development server:
   ```bash
   pnpm dev
   ```

### Build

```bash
pnpm build
```

### Docker

Build and run with Docker:

```bash
# Build
docker build -f apps/_portfolio/Dockerfile -t portfolio:local \
  --build-arg PROJECT=@monorepo/_portfolio \
  --build-arg APP_DIRNAME=_portfolio \
  --build-arg NODE_ENV=dockerfile .

# Run
docker run --rm -p 3000:3000 portfolio:local
```

## Deployment

The app is configured for Vercel deployment with:

- Standalone output for Docker
- Environment-specific builds
- Sentry integration for error tracking

## Live Application

- **Production**: [Portfolio v1](https://portfolio-ui-2025v1.vercel.app)

## Differences from Template

This app extends the base template with:

1. **Documentation System**: Full docs with code examples
2. **About Page**: Personal portfolio information
3. **Rate Limiting**: API protection
4. **Sitemap Generation**: Dynamic sitemaps
5. **Additional Dependencies**: Form handling, syntax highlighting, etc.
6. **Custom Hooks**: `use-infinite-scroll` hook
7. **Theme Support**: Light/dark mode with next-themes

## Code Organization

- **Features**: Organized by feature (about, docs, home, layout)
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **Utils**: Utility functions (rate limiting, sitemap)
- **Types**: TypeScript type definitions

## Best Practices

This app follows the same best practices as the template:

- Server Components by default
- Type safety with TypeScript
- Internationalization with next-intl
- Error handling with boundaries
- Performance optimization
- Code organization by features

## Resources

- Based on `apps/_template` - See template README for base patterns
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest)
