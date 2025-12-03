# Document Application

Admin dashboard application built with Next.js 15, featuring authentication, MongoDB integration, and comprehensive admin features.

## Overview

This is an admin dashboard application that provides:

- **Authentication**: Better Auth integration with Google OAuth
- **MongoDB Integration**: Database connectivity and health checks
- **Internationalization**: Multi-language support (English, Vietnamese)
- **Theme Support**: Light and dark mode
- **Protected Routes**: Authentication-based route protection
- **Admin Features**: Dashboard and management interfaces

## Features

### Authentication

- **Better Auth**: Modern authentication library
- **Google OAuth**: Sign in with Google
- **Session Management**: Secure session handling
- **Protected Routes**: Middleware-based route protection
- **Email Allowlist**: Restricted access based on email domain

### Database

- **MongoDB**: Database integration
- **Health Checks**: Database connectivity monitoring
- **Connection Management**: Efficient connection handling

### Pages

- **Home** (`/`): Dashboard home page
- **Sign In** (`/sign-in`): Authentication page
- **Auth Callback** (`/auth/callback`): OAuth callback handler

### Key Features

- **Route Protection**: Middleware-based authentication
- **Internationalization**: Multi-language support
- **Theme Management**: Light/dark mode with next-themes
- **Sidebar Navigation**: Collapsible sidebar with navigation
- **Error Handling**: Comprehensive error boundaries
- **Sitemap Generation**: Dynamic sitemap generation

## Project Structure

```
document/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── auth/          # Authentication routes
│   │   │   │   ├── callback/  # OAuth callback
│   │   │   │   └── sign-in/   # Sign in page
│   │   │   └── [...rest]/      # Catch-all routes
│   │   └── api/               # API routes
│   │       ├── auth/           # Auth API (Better Auth)
│   │       └── health/       # Health check endpoints
│   ├── components/            # Shared components
│   │   ├── exception/         # Error/404 components
│   │   ├── next-image/        # Image wrapper
│   │   └── next-link/         # Link wrapper
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication feature
│   │   │   ├── hooks/         # Auth hooks
│   │   │   ├── provider/     # Auth provider
│   │   │   └── templates/    # Auth templates
│   │   ├── home/              # Home page feature
│   │   └── layout/            # Layout components
│   │       ├── components/    # Sidebar, toggles
│   │       └── templates/     # Layout templates
│   ├── libs/                  # Library configurations
│   │   ├── auth.ts            # Better Auth config
│   │   ├── auth-client.ts     # Client auth config
│   │   ├── mongodb.ts         # MongoDB connection
│   │   ├── allowed-emails.ts  # Email allowlist
│   │   └── query-client.ts    # TanStack Query config
│   ├── constants/             # App constants
│   │   ├── routes.ts          # Route definitions
│   │   ├── sidebar.ts         # Sidebar configuration
│   │   └── fonts.ts           # Font configurations
│   ├── utils/                 # Utility functions
│   │   ├── metadata.ts        # Metadata helpers
│   │   ├── path-helpers.ts    # Path utilities
│   │   ├── redirect-helpers.ts # Redirect utilities
│   │   ├── logger.ts          # Logging utilities
│   │   └── sitemap/           # Sitemap utilities
│   └── types/                 # TypeScript types
│       ├── auth.ts            # Auth types
│       ├── database.ts        # Database types
│       └── oauth.ts           # OAuth types
└── messages/                  # i18n translation files
```

## Dependencies

### Core Dependencies

- `next` - Next.js framework
- `react` & `react-dom` - React library
- `next-intl` - Internationalization
- `better-auth` - Authentication library
- `mongodb` - MongoDB driver
- `@monorepo/ui` - Shared UI components
- `@monorepo/sentry` - Sentry integration
- `@monorepo/env` - Environment variable management
- `@monorepo/hook` - Shared React hooks
- `@tanstack/react-query` - Data fetching
- `@tanstack/react-query-devtools` - Query devtools
- `sonner` - Toast notifications
- `next-themes` - Theme management
- `zod` - Schema validation

### Additional Dependencies

- `@hookform/resolvers` - Form validation resolvers
- `react-hook-form` - Form management
- `cookies-next` - Cookie management
- `react-error-boundary` - Error boundary component
- `react-syntax-highlighter` - Code syntax highlighting
- `lucide-react` - Icons
- `motion` - Animation library

## Getting Started

### Prerequisites

- Node.js >= 22.21.0
- pnpm >= 10.19.0
- MongoDB database
- Google OAuth credentials

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Configure environment variables in root `.env`:

   ```env
   # Database
   DATABASE_URL=mongodb://localhost:27017/document

   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Allowed emails (comma-separated)
   ALLOWED_EMAILS=admin@example.com,user@example.com
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
docker build -f apps/document/Dockerfile -t document:local \
  --build-arg PROJECT=@monorepo/document \
  --build-arg APP_DIRNAME=document \
  --build-arg NODE_ENV=dockerfile .

# Run
docker run --rm -p 3000:3000 document:local
```

## Authentication

### Better Auth Setup

The app uses Better Auth for authentication:

- **Provider**: Google OAuth
- **Session**: Cookie-based sessions
- **Email Allowlist**: Restricted access by email
- **Protected Routes**: Middleware-based protection

### Auth Flow

1. User visits protected route
2. Middleware checks for session cookie
3. If no session, redirects to sign-in
4. User signs in with Google OAuth
5. Callback handler processes OAuth response
6. Session created and user redirected

### Email Allowlist

Access is restricted to emails in the allowlist:

```typescript
// src/libs/allowed-emails.ts
export const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(",") || [];
```

## Database

### MongoDB Integration

The app connects to MongoDB:

- **Connection**: Managed connection pool
- **Health Checks**: `/api/health/mongodb` endpoint
- **Error Handling**: Graceful connection errors

### Database Utilities

```typescript
// src/libs/mongodb.ts
import { getMongoClient } from "~/libs/mongodb";

// Use in server components/API routes
const client = await getMongoClient();
```

## Key Components

### Auth Provider

Wraps the app with Better Auth provider:

```tsx
// src/features/auth/provider/auth.provider.tsx
<AuthProvider>{children}</AuthProvider>
```

### Layout Template

Main layout with sidebar and header:

- **Sidebar**: Collapsible navigation
- **Header**: Theme and language toggles
- **Responsive**: Mobile-friendly design

### Protected Routes

Middleware protects routes:

- **Public Routes**: Sign-in page
- **Protected Routes**: All other routes require auth
- **API Routes**: Auth API excluded from protection

## Environment Variables

Required environment variables:

- `DATABASE_URL` - MongoDB connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Auth base URL
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `ALLOWED_EMAILS` - Comma-separated allowed emails

Optional:

- `NEXT_PUBLIC_ENV` - Environment (local, development, production)

## Development

### Code Style

- Follows monorepo ESLint and Prettier configurations
- TypeScript for type safety
- Server Components by default
- Client Components only when needed

### Best Practices

- Use Server Components for static content
- Use Client Components for interactivity
- Proper error handling with boundaries
- Type safety with TypeScript
- Performance optimization
- Authentication checks in middleware and server components

## Differences from Template

This app extends the base template with:

1. **Authentication**: Better Auth integration
2. **Database**: MongoDB connectivity
3. **Protected Routes**: Middleware-based protection
4. **Email Allowlist**: Access restriction
5. **Additional Dependencies**: Auth, database, form handling
6. **Complex Layout**: Sidebar navigation system
7. **Health Checks**: Database monitoring

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)

## Support

For questions or issues:

- Check the main monorepo `README.md`
- Review `.cursor/rules/` for coding guidelines
- See template README for base patterns
