import * as Sentry from "@sentry/nextjs";

const init = ({ dsn = "" }: { dsn?: string }) =>
  Sentry.init({
    dsn: dsn,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.browserTracingIntegration(),
      // Sentry.feedbackIntegration({
      //   // Enable the automatic injection of the default widget (default false)
      //   autoInject: true,
      //   // Additional options to ensure widget appears
      //   showBranding: false,
      // }),
    ],
    // We recommend adjusting this value in production, or using `tracesSampler`
    // for finer control
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      "localhost", // For local development
      /^\/api\//, // For same-origin API calls
      // "https://api.example.com", // For your backend domain
      // "https://auth.example.com", // For additional services
    ],
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
    // Set profilesSampleRate to 1.0 to profile every transaction.
    // Since profilesSampleRate is relative to tracesSampleRate,
    // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
    // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
    // result in 25% of transactions being profiled (0.5*0.5=0.25)
    profilesSampleRate: 1.0,
  });

export default init;
