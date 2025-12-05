# @monorepo/sentry

Sentry integration package for error tracking and performance monitoring.

## Overview

This package provides Sentry integration for Next.js applications with separate configurations for client, server, and edge runtimes. It includes error tracking, performance monitoring, and session replay.

## Features

- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Transaction tracing and performance metrics
- **Session Replay**: User session recording for debugging
- **Source Maps**: Automatic source map upload
- **Multi-runtime Support**: Client, server, and edge configurations

## Usage

### Basic Setup

```typescript
// apps/my-app/sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

import init from "@monorepo/sentry/server";

init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });

export default Sentry.withSentryConfig(nextConfig, {
  org: "sentry",
  project: "my-app",
});
```

### Client-side

```typescript
// apps/my-app/instrumentation-client.ts
import init from "@monorepo/sentry/client";

init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
```

### Server-side

```typescript
// apps/my-app/instrumentation.ts
import { Sentry } from "@monorepo/sentry";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Additional configuration
});
```

### Edge Runtime

```typescript
// apps/my-app/sentry.edge.config.ts
import init from "@monorepo/sentry/edge";

init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
```

## Exports

### Main Export

```typescript
import { Sentry } from "@monorepo/sentry";

// Use Sentry APIs
Sentry.captureException(error);
Sentry.captureMessage("Something went wrong");
```

### Client Export

```typescript
import init from "@monorepo/sentry/client";

init({ dsn: "your-dsn" });
```

### Server Export

```typescript
import init from "@monorepo/sentry/server";

init({ dsn: "your-dsn" });
```

### Edge Export

```typescript
import init from "@monorepo/sentry/edge";

init({ dsn: "your-dsn" });
```

## Configuration

### Client Configuration

- **Session Replay**: Enabled with 10% sample rate
- **Error Replay**: 100% sample rate for errors
- **Browser Tracing**: Enabled for performance monitoring
- **Profiling**: Enabled with 100% sample rate

### Server Configuration

- **Node Profiling**: Enabled for performance profiling
- **Request Tracing**: Enabled for API route monitoring
- **Default PII**: Enabled (sends IP and headers)

### Edge Configuration

- **Request Tracing**: Enabled
- **Default PII**: Enabled

## Environment Variables

- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for your project
- `SENTRY_ORG` - Sentry organization (for source maps)
- `SENTRY_PROJECT` - Sentry project name (for source maps)
- `SENTRY_AUTH_TOKEN` - Sentry auth token (for source maps)

## Best Practices

1. **DSN Configuration**: Use environment variables for DSN
2. **Sample Rates**: Adjust sample rates based on traffic
3. **Source Maps**: Always upload source maps for better error tracking
4. **Error Boundaries**: Use React error boundaries with Sentry
5. **Performance**: Monitor performance with transaction tracing

## Dependencies

- `@sentry/nextjs` - Next.js Sentry SDK
- `@sentry/profiling-node` - Node.js profiling integration
- `next` - Next.js framework

## Related Documentation

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Integration Documentation](../../docs/packages/SENTRY.md)
