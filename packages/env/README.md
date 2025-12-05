# @monorepo/env

Shared environment variable validation package using `@t3-oss/env-nextjs` and Zod.

## Overview

This package provides centralized, type-safe environment variable validation for all applications in the monorepo. It ensures that all environment variables are validated at build time and provides type-safe access throughout the codebase.

## Features

- **Type Safety**: TypeScript types generated from Zod schemas
- **Build-time Validation**: Environment variables are validated during build
- **Runtime Validation**: Runtime checks ensure variables are valid
- **Centralized Configuration**: Single source of truth for environment variables

## Usage

### In Applications

```typescript
import { env } from "@monorepo/env";

// Access validated environment variables
const nodeEnv = env.NODE_ENV; // Type: "development" | "production" | "test"
const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY; // Type: string | undefined
```

### Extending in Apps

Each app can extend the base environment configuration:

```typescript
// apps/my-app/src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";

import { env as envBase } from "@monorepo/env";

export const env = createEnv({
  server: {},
  client: {},
  experimental__runtimeEnv: {},
  extends: [envBase], // Extend base configuration
});
```

## Environment Variables

### Server Variables

- `NODE_ENV` - Node environment (development, production, test)
- `DISCORD_TOKEN` - Discord bot token (optional)
- `MONGODB_URL` - MongoDB connection URL (optional)
- `BETTER_AUTH_SECRET` - Better Auth secret key (optional)
- `BETTER_AUTH_URL` - Better Auth base URL (optional)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key (optional)

### Client Variables

- `NEXT_PUBLIC_ENV` - Public environment identifier (optional)
- `NEXT_PUBLIC_TEMPLATE_DOMAIN` - Template app domain (optional)
- `NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN` - Portfolio v1 domain (optional)
- `NEXT_PUBLIC_PORTFOLIO_DOMAIN` - Portfolio domain (optional)
- `NEXT_PUBLIC_ASSISTANT_AI_DOMAIN` - Assistant AI domain (optional)
- `NEXT_PUBLIC_SENTRY_TEMPLATE_DSN` - Sentry DSN for template (optional)
- `NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN` - Sentry DSN for portfolio v1 (optional)
- `NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN` - Sentry DSN for portfolio (optional)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS` - Google Analytics ID (optional)
- `NEXT_PUBLIC_GOOGLE_TAG_MANAGER` - Google Tag Manager ID (optional)

## Configuration

All environment variables are optional by default. To make them required, modify the schema in `src/index.ts`:

```typescript
// Make a variable required
GOOGLE_GENERATIVE_AI_API_KEY: z.string(), // Remove .optional()
```

## Best Practices

1. **Always use this package**: Never access `process.env` directly
2. **Extend, don't duplicate**: Apps should extend the base config
3. **Type safety**: Let TypeScript guide you with autocomplete
4. **Validation**: All variables are validated at build time

## Dependencies

- `@t3-oss/env-nextjs` - Environment variable validation
- `zod` - Schema validation

## Related Documentation

- [T3 Env Documentation](https://env.t3.gg/)
- [Zod Documentation](https://zod.dev/)
