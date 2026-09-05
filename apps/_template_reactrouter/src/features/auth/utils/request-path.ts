/**
 * The path a visitor asked for, as `pathname + search`, with the router's own
 * transport details taken back out.
 *
 * On a client-side navigation the server does not receive `/dashboard?tab=1`;
 * it receives `/dashboard.data?tab=1&_routes=routes%2Fdashboard` — the single
 * fetch the router makes for that page's loaders. A guard that copied that into
 * `redirectTo` would send the visitor back to a `.data` URL after sign-in, and
 * the browser would display a turbo-stream payload as the page.
 *
 * React Router 8.3 already hands middleware a normalized `url` beside the raw
 * `request` (`lib/server-runtime/urls.ts` does exactly this stripping), and the
 * guard reads that one. This helper still does the same work on whatever it is
 * given, for two reasons: it makes the guard indifferent to which of the two
 * URLs a caller — or a test building the args by hand — passes, and it keeps
 * the rule testable on its own with a `.data`-shaped input.
 *
 * The three things stripped mirror the runtime: the `.data` / `_.data` suffix,
 * the `_routes` param (which loaders to run), and a BARE `index` param (the
 * index-route action marker). An `index` that carries a value is app data and
 * stays. The hash is never carried: a server never receives one.
 */
export function normalizeRequestPath(url: URL): string {
  let pathname = url.pathname;

  if (pathname.endsWith("/_.data")) {
    pathname = pathname.slice(0, -"_.data".length);
  } else if (pathname.endsWith(".data")) {
    pathname = pathname.slice(0, -".data".length);
  }

  const searchParams = new URLSearchParams(url.search);
  searchParams.delete("_routes");

  const indexValues = searchParams.getAll("index").filter(Boolean);
  searchParams.delete("index");
  for (const value of indexValues) searchParams.append("index", value);

  const search = searchParams.toString();

  return search ? `${pathname}?${search}` : pathname;
}
