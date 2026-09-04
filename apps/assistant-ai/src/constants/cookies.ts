/**
 * The language cookie next-intl writes when a visitor switches language. Named
 * per app so two apps on the same domain do not fight over one value.
 */
export const LANGUAGE_COOKIE_NAME = "assistant_ai_lang";

/**
 * The session cookie `proxy.ts` gates the protected route group on.
 *
 * It is `HttpOnly` (see `~/features/auth/actions/sign-in`), which is why this
 * app has no auth store: the browser attaches the cookie and no script can read
 * it. A persisted Zustand token would undo exactly that.
 */
export const SESSION_COOKIE_NAME = "assistant_ai_session";
