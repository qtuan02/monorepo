/**
 * The language cookie. Two writers have to agree on this one name: the i18next
 * detector caches the visitor's choice into it in the browser (`caches:
 * ["cookie"]`, see `~/libs/i18n`), and `resolveLanguage` reads it back out of
 * the `Cookie` header on the next server render. Named per app so two apps on
 * the same domain do not fight over one value.
 *
 * This Runtime keeps the language here rather than in the URL, which is the one
 * place it deliberately diverges from `_template_next`'s `[locale]` segment: a
 * cookie plus `Accept-Language` needs no path rewriting, and a Template whose
 * every route is prefixed would force that prefix onto every clone.
 */
export const LANGUAGE_COOKIE_NAME = "template_reactrouter_lang";

/**
 * The session cookie `~/routes/protected`'s middleware gates the guarded group
 * on. Minted by the sign-in route's `action` through `~/libs/session.server`,
 * where its attributes live — `HttpOnly`, so no script can read it, and signed
 * with the server secret, so no script can forge one either. That is why this
 * app has no auth store: the browser attaches the cookie and nothing in the
 * bundle ever holds a token (contrast `_template_vite`'s persisted
 * `useAuthStore`, which a cookie like this makes unnecessary).
 */
export const SESSION_COOKIE_NAME = "template_reactrouter_session";
