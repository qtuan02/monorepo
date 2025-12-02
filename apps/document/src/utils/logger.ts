import { Sentry } from "@monorepo/sentry";

import { env } from "~/env";

const isDevelopment = env.NEXT_PUBLIC_ENV === "local" || process.env.NODE_ENV === "development";

/**
 * Logger utility that only logs in development and integrates with Sentry for production errors.
 */
export const logger = {
  /**
   * Logs informational messages (only in development).
   * @param message - The message to log
   * @param data - Optional additional data to log
   */
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
    }
  },

  /**
   * Logs warning messages (only in development).
   * @param message - The warning message to log
   * @param data - Optional additional data to log
   */
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : "");
    }
  },

  /**
   * Logs error messages and sends to Sentry in production.
   * @param message - The error message to log
   * @param error - The error object or additional data
   */
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, send to Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { source: "logger" },
          extra: { message },
        });
      } else {
        Sentry.captureMessage(message, {
          level: "error",
          tags: { source: "logger" },
          extra: { error },
        });
      }
    }
  },
};

