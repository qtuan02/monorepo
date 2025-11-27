import init from "@monorepo/sentry/edge";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN,
});
