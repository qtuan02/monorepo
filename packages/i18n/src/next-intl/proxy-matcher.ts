/**
 * Every path except the API routes, Next's own assets, and anything with a dot
 * in it (a file) — the request set that is worth negotiating a locale for.
 *
 * Copy this value **as a literal** into the app's `proxy.ts`; do not import the
 * constant there. Next extracts `config` by static AST analysis of that file,
 * so an identifier it cannot evaluate counts as a dynamic value and is silently
 * ignored — the proxy would then run on every request, static assets included,
 * with nothing to warn you.
 *
 * It lives apart from `create-proxy.ts` so it can be read (and asserted) without
 * loading `next-intl/middleware`, which reaches for `next/server` and therefore
 * only resolves inside a Next build.
 */
export const I18N_PROXY_MATCHER = "/((?!api|trpc|_next|_vercel|.*\\..*).*)";
