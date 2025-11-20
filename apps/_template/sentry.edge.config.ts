import init from "@monorepo/sentry/edge";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_TEMPLATE_DSN,
});
