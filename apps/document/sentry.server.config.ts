import init from "@monorepo/sentry/server";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN,
});
