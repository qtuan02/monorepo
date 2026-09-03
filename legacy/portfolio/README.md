# Portfolio Application

Frontend portfolio application built with Next.js 15, featuring a modern UI with animations and theme support.

## Overview

This is a portfolio application that showcases:

- **Modern UI**: Clean, animated interface
- **Theme Support**: Light and dark mode
- **Responsive Design**: Mobile-first responsive layout
- **Animations**: Smooth animations with Motion library
- **Markdown Support**: Content rendering with react-markdown
- **Sitemap Generation**: Dynamic sitemap generation

## Features

### UI Components

- **Blur Fade**: Animated blur fade effects
- **Card Components**: Resume and project cards
- **Dock**: macOS-style dock navigation
- **Lens**: Interactive lens effect
- **Theme Toggle**: Animated theme switcher

### Pages

- **Home** (`/`): Main portfolio page
- **Resume**: Resume display with cards
- **Projects**: Project showcase

### Key Features

- **No i18n**: Single language (English)
- **Theme Management**: Light/dark mode with next-themes
- **Animations**: Motion library for smooth animations
- **Markdown**: Content rendering support
- **Sitemap**: Dynamic sitemap generation

## Project Structure

```
portfolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [...rest]/         # Catch-all routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── provider.tsx       # Client providers
│   │   ├── manifest.ts        # PWA manifest
│   │   ├── robot.ts           # robots.txt
│   │   └── sitemap.xml/       # Sitemap generation
│   ├── components/            # React components
│   │   ├── blur-fade.tsx     # Blur fade animation
│   │   ├── blur-fade-text.tsx # Text blur fade
│   │   ├── card.tsx          # Card component
│   │   ├── dock.tsx          # Dock navigation
│   │   ├── lens.tsx          # Lens effect
│   │   ├── resume-card.tsx  # Resume card
│   │   └── theme-toggle-gif.tsx # Theme toggle
│   ├── features/              # Feature modules
│   │   ├── home.tsx          # Home feature
│   │   └── navbar.tsx        # Navigation bar
│   ├── constants/            # App constants
│   │   ├── common.ts         # Common constants
│   │   └── data.ts           # Portfolio data
│   └── utils/                # Utility functions
│       ├── get-metadata-default.ts # Metadata helper
│       └── sitemap/           # Sitemap utilities
└── public/                   # Static assets
```

## Dependencies

### Core Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@monorepo/ui` - Shared UI components
- `@monorepo/sentry` - Sentry integration
- `@monorepo/env` - Environment variable management
- `lucide-react` - Icons
- `motion` - Animation library
- `next-themes` - Theme management
- `react-markdown` - Markdown rendering

### Development Dependencies

- `typescript` - TypeScript compiler
- `eslint` - Linting
- `prettier` - Code formatting
- `@monorepo/eslint-config` - Shared ESLint config
- `@monorepo/prettier-config` - Shared Prettier config
- `@monorepo/tailwind-config` - Shared Tailwind config
- `@monorepo/tsconfig` - Shared TypeScript config

## Getting Started

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in root `.env`:

   ```env
   NEXT_PUBLIC_ENV=local
   ```

3. Run development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build

```bash
pnpm build
```

### Docker

Build and run with Docker:

```bash
# Build
docker build -f apps/portfolio/Dockerfile -t portfolio:local \
  --build-arg PROJECT=@monorepo/portfolio \
  --build-arg APP_DIRNAME=portfolio \
  --build-arg NODE_ENV=dockerfile .

# Run
docker run --rm -p 3000:3000 portfolio:local
```

## Key Components

### Blur Fade

Animated blur fade effect for smooth transitions:

```tsx
<BlurFade delay={0.1}>{content}</BlurFade>
```

### Dock

macOS-style dock navigation:

- Hover effects
- Smooth animations
- Responsive design

### Theme Toggle

Animated theme switcher with GIF support:

- Light/dark mode
- Smooth transitions
- Visual feedback

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_ENV` - Environment (local, development, production)

Optional (configured via `@monorepo/env`):

- Sentry configuration variables

## Development

### Code Style

- Follows monorepo ESLint and Prettier configurations
- TypeScript for type safety
- Server Components by default
- Client Components only when needed

### Best Practices

- Use Server Components for static content
- Use Client Components for interactivity
- Proper error handling
- Type safety with TypeScript
- Performance optimization
- Smooth animations

## Differences from Template

This app has a different structure from the template:

1. **No `src/app/[locale]/`**: No internationalization
2. **Simpler Structure**: Direct app router structure
3. **No i18n**: Single language (English)
4. **Different Dependencies**: Focused on UI and animations
5. **Custom Components**: Specialized portfolio components
6. **No TanStack Query**: No data fetching library

## Deployment

The app is configured for Vercel deployment with:

- Standalone output for Docker
- Environment-specific builds
- Sentry integration for error tracking
- Sitemap generation

## Live Application

- **Production**: [Portfolio](https://portfolio-ui-2025.vercel.app)

## Resources

- Based on `apps/_template` - See template README for base patterns
- [Next.js Documentation](https://nextjs.org/docs)
- [Motion Documentation](https://motion.dev/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [next-themes](https://github.com/pacocoursey/next-themes)

## Support

For questions or issues:

- Check the main monorepo `README.md`
- Review `.cursor/rules/` for coding guidelines
- See template README for base patterns
