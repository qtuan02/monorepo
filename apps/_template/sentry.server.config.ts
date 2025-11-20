import init from "@monorepo/sentry/server";

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_TEMPLATE_DSN,
});
