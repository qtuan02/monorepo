import { Sentry } from "@monorepo/sentry";

import { logger } from "./logger";

/**
 * Error types for better error handling
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 500);
    this.name = "DatabaseError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = "AuthError";
  }
}

/**
 * Handles errors with proper logging and Sentry integration
 * @param error - The error to handle
 * @param context - Additional context about where the error occurred
 * @returns Formatted error message
 */
export function handleError(
  error: unknown,
  context?: string,
): { message: string; code?: string; statusCode?: number } {
  const contextPrefix = context ? `[${context}] ` : "";

  if (error instanceof AppError) {
    logger.error(`${contextPrefix}${error.message}`, error);
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    logger.error(`${contextPrefix}${error.message}`, error);
    Sentry.captureException(error, {
      tags: { context },
    });
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  const unknownError = "An unknown error occurred";
  logger.error(`${contextPrefix}${unknownError}`, error);
  Sentry.captureMessage(unknownError, {
    level: "error",
    tags: { context },
    extra: { error },
  });

  return {
    message: unknownError,
    statusCode: 500,
  };
}

/**
 * Wraps an async function with error handling
 * @param fn - The async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}

