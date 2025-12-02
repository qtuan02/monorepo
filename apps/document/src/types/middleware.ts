import type { NextRequest, NextResponse } from "next/server";

/**
 * Middleware context containing parsed pathname information
 */
export interface MiddlewareContext {
  pathname: string;
  pathnameWithoutLocale: string;
  locale: string;
}

/**
 * Type for middleware function that processes requests
 */
export type MiddlewareHandler = (
  request: NextRequest,
  context: MiddlewareContext,
) => Promise<NextResponse> | NextResponse;

