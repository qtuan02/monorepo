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
