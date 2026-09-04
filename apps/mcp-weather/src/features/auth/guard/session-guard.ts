import { isLanguageCode } from "@monorepo/i18n/languages";

import { PROTECTED_ROUTE_PREFIXES, ROUTES } from "~/constants/routes";

export interface SessionGuardInput {
  /** The request pathname exactly as it arrived, locale prefix included. */
  pathname: string;
  /**
   * The request's query string, leading `?` included, or `""`. It is carried
   * only so `redirectTo` can name the whole URL the visitor asked for: bouncing
   * `/dashboard?tab=billing&page=3` back to a bare `/dashboard` after sign-in
   * loses the filters, which is the one thing `redirectTo` exists to preserve.
   */
  search?: string;
  /** Whether the session cookie is present. The guard never reads a request. */
  hasSession: boolean;
}

export interface SessionRedirect {
  /** Where to send the visitor, with the same locale prefix they arrived on. */
  pathname: string;
  /** Where they were headed — the sign-in screen bounces back to it. */
  redirectTo?: string;
}

export interface SplitPathname {
  /** The locale segment, or `undefined` on an unprefixed default-locale path. */
  locale: string | undefined;
  /** The rest of the path, always starting with `/`. */
  rest: string;
}

/**
 * Splits `/en/dashboard` into `{ locale: "en", rest: "/dashboard" }`, and leaves
 * `/dashboard` as `{ locale: undefined, rest: "/dashboard" }` — the shape an
 * unprefixed default-locale path takes under `localePrefix: "as-needed"`.
 */
export function splitLocalePrefix(pathname: string): SplitPathname {
  const [, head = "", ...tail] = pathname.split("/");

  if (!isLanguageCode(head)) {
    return { locale: undefined, rest: pathname };
  }

  const rest = tail.join("/");

  return { locale: head, rest: rest.length > 0 ? `/${rest}` : "/" };
}

/** Re-attaches the prefix a request arrived with, or none if it had none. */
export function withLocalePrefix(
  locale: string | undefined,
  pathname: string,
): string {
  if (!locale) return pathname;

  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

/** True for a path inside the protected group, prefix-matched. */
export function isProtectedPathname(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * The whole access decision, as a pure function of a pathname and one boolean.
 *
 * It is deliberately not a middleware: a `NextRequest` cannot be constructed in
 * a unit test without a running Next, and the interesting part — which paths are
 * gated, which way the guest redirect points, how the locale prefix survives — is
 * exactly the part that has nothing to do with HTTP. `proxy.ts` supplies the two
 * inputs and turns a returned `SessionRedirect` into a 307.
 *
 * Returns `null` when the request may proceed.
 */
export function decideSessionRedirect({
  pathname,
  search = "",
  hasSession,
}: SessionGuardInput): SessionRedirect | null {
  const { locale, rest } = splitLocalePrefix(pathname);

  if (isProtectedPathname(rest) && !hasSession) {
    return {
      pathname: withLocalePrefix(locale, ROUTES.SIGN_IN),
      redirectTo: `${pathname}${search}`,
    };
  }

  // The guest half: a signed-in visitor landing on sign-in goes home instead of
  // being offered a second session. Same reasoning as the SPA's `GuestRoute`.
  if (rest === ROUTES.SIGN_IN && hasSession) {
    return { pathname: withLocalePrefix(locale, ROUTES.HOME) };
  }

  return null;
}
