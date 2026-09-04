import { initSentryClient } from "@monorepo/sentry/client";

import { env } from "~/env";

// Next loads this file before it hydrates, so the SDK is installed ahead of any
// app code. With no DSN in `.env` the call is a no-op — see `@monorepo/sentry`.
initSentryClient({
  dsn: env.NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN,
  environment: env.NEXT_PUBLIC_APP_ENV,
});

/** Turns an App Router navigation into a span. Next looks it up by this name. */
export { captureRouterTransitionStart as onRouterTransitionStart } from "@monorepo/sentry/client";
