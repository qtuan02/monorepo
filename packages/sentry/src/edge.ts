import * as Sentry from "@sentry/nextjs";

const init = ({ dsn = "" }: { dsn?: string }) =>
  Sentry.init({
    dsn: dsn,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // We recommend adjusting this value in production, or using `tracesSampler`
    // for finer control
    tracesSampleRate: 1.0,
  });

export default init;
