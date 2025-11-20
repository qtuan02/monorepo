import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const init = ({ dsn = "" }: { dsn?: string }) =>
  Sentry.init({
    dsn: dsn,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // @ts-ignore
    integrations: [nodeProfilingIntegration()],
    // We recommend adjusting this value in production, or using `tracesSampler`
    // for finer control
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: "trace",
  });

export default init;
