# Sentry Integration

This document describes how Sentry is integrated and used across Next.js applications in the monorepo.

## Overview

Sentry is used for error tracking, performance monitoring, and session replay. Integration is managed centrally through the `@monorepo/sentry` package for consistent configuration.

## Package Structure

The `@monorepo/sentry` package provides separate modules for each runtime:

- `@monorepo/sentry/client` - Browser/client-side configuration
- `@monorepo/sentry/server` - Node.js server configuration
- `@monorepo/sentry/edge` - Edge runtime configuration
- `@monorepo/sentry` - Exports utilities from `@sentry/nextjs`

## Features

- **Error Tracking**: Automatic unhandled exception capture
- **Performance Monitoring**: Browser and server-side tracing
- **Session Replay**: 10% normal sessions, 100% on errors
- **Source Maps**: Automatic upload in CI builds

## Setup

Each app needs the following files:

### 1. Instrumentation Files

**`src/instrumentation.ts`** - Server and edge runtime:

```typescript
import { Sentry } from "@monorepo/sentry";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
```

**`src/instrumentation-client.ts`** - Client-side:

```typescript
import { Sentry } from "@monorepo/sentry";
import init from "@monorepo/sentry/client";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_ < APP_NAME > _DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

### 2. Sentry Config Files

**`sentry.server.config.ts`**:

```typescript
import init from "@monorepo/sentry/server";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_ < APP_NAME > _DSN,
});
```

**`sentry.edge.config.ts`**:

```typescript
import init from "@monorepo/sentry/edge";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_ < APP_NAME > _DSN,
});
```

### 3. Next.js Config

Wrap your Next.js config with `Sentry.withSentryConfig`:

```typescript
import { Sentry } from "@monorepo/sentry";

export default Sentry.withSentryConfig(nextConfig, {
  org: "sentry",
  project: "<project-name>",
  silent: !process.env.CI,
  disableLogger: true,
  reactComponentAnnotation: {
    enabled: true,
  },
});
```

### 4. Global Error Handler

**`src/app/global-error.tsx`**:

```typescript
"use client";

import { useEffect } from "react";
import NextError from "next/error";
import { Sentry } from "@monorepo/sentry";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
```

## Environment Variables

Each app requires its own DSN:

- `_portfolio`: `NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN`
- `_template`: `NEXT_PUBLIC_SENTRY_TEMPLATE_DSN`
- `portfolio`: `NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN`
- `document`: `NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN`

Add these to `.env` in the monorepo root.

## Usage

### Capture Exception

```typescript
import { Sentry } from "@monorepo/sentry";

try {
  // code
} catch (error) {
  Sentry.captureException(error);
}
```

### Capture Message

```typescript
Sentry.captureMessage("Something went wrong", "error");
```

### Add Context

```typescript
Sentry.setUser({ id: "123", email: "user@example.com" });
Sentry.setTag("page", "checkout");
Sentry.setContext("order", { id: "order-123", total: 100 });
```

## Sentry Projects

Each app has its own project in the Sentry organization:

- `_portfolio` → `portfolio_v1`
- `_template` → `template`
- `portfolio` → `portfolio_v1`
- `document` → (shares DSN with `_portfolio`)

## Best Practices

1. **Adjust sample rates** in production to control costs (`tracesSampleRate`, `replaysSessionSampleRate`)
2. **Never commit DSNs** - use environment variables only
3. **Filter unnecessary errors** in Sentry dashboard
4. **Monitor performance impact** of sampling rates
5. **Consider privacy** when enabling `sendDefaultPii`

## Troubleshooting

**Source maps not uploading:**

- Check `SENTRY_AUTH_TOKEN` in CI environment
- Ensure `silent: !process.env.CI` to see logs

**Errors not captured:**

- Verify DSN is set correctly
- Confirm instrumentation files are imported
- Check Sentry dashboard for SDK errors

**Performance issues:**

- Reduce `tracesSampleRate` and `replaysSessionSampleRate`
- Disable profiling if not needed
- Use `tracesSampler` for fine-grained control
