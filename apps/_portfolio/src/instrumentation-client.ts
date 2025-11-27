import { Sentry } from "@monorepo/sentry";
import init from "@monorepo/sentry/client";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
