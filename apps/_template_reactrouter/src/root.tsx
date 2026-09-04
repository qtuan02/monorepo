import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRevalidator,
} from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";
import { resolveLanguage } from "@monorepo/i18n/resolve-language";

import type { Route } from "./+types/root";
import { ExceptionState } from "~/components/exception/exception-state";
import InternalServerError from "~/components/exception/internal-server-error";
import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";
import { languageContext } from "~/libs/language-context";
import stylesheet from "./globals.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "stylesheet", href: stylesheet },
];

/**
 * The one place this app decides what language a request is in — cookie, then
 * `Accept-Language`, then the registry default. Root middleware runs on every
 * document request before any loader and before the render, and it writes into
 * the per-request `RouterContextProvider` that `entry.server` also receives, so
 * one decision serves the loader, the `meta` functions and the i18next instance
 * the tree is rendered with.
 *
 * The decision itself is `@monorepo/i18n/resolve-language` — a pure function of
 * the request headers, shared with every Runtime and tested in that package. All
 * this adds is the cookie name and the place to put the answer.
 */
export const middleware: Route.MiddlewareFunction[] = [
  ({ request, context }, next) => {
    context.set(
      languageContext,
      resolveLanguage(request, LANGUAGE_COOKIE_NAME),
    );

    return next();
  },
];

/**
 * Carries the negotiated language into the hydration payload, which is what
 * makes it reachable from a `meta` function: `meta` runs outside the React tree,
 * so it cannot read the provider, and a child route reaches this value through
 * `matches[0].loaderData` (see `~/routes/home`).
 *
 * It reads the context rather than the request a second time — the same value,
 * but decided once, so a future guard cannot leave the two disagreeing.
 */
export function loader({ context }: Route.LoaderArgs) {
  return { language: context.get(languageContext) };
}

/**
 * The document shell. It is a separate export from `App` on purpose: React
 * Router renders `Layout` around whichever of `App`, `ErrorBoundary` or
 * `HydrateFallback` is current, so a thrown error swaps the content without
 * remounting `<html>`.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  /*
   * Read off the i18next instance that is rendering this very tree — the
   * per-request clone on the server, the singleton in the browser — rather than
   * off `loaderData`. Three reasons, in the order they bite:
   *
   * - `Layout` also wraps `ErrorBoundary`, and on that path no loader ran, so
   *   `useRouteLoaderData("root")` is `undefined` and a 500 page would announce
   *   itself in the wrong language.
   * - Switching language in the header does not re-run a loader, so a
   *   loader-derived `lang` would go stale the moment a visitor switches.
   * - It is by construction the value `entry.client` reads back off
   *   `document.documentElement.lang` before hydrating, which is what keeps the
   *   client's first render identical to the server's.
   *
   * `resolvedLanguage`, not `language`: the browser detector keeps the detected
   * tag verbatim, so `language` can be `vi-VN` — not a registry code, and not
   * what the server put in this attribute.
   */
  const language = i18n.resolvedLanguage ?? defaultLanguage;

  return (
    <html lang={language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { i18n } = useTranslation();
  const { revalidate } = useRevalidator();

  /*
   * Keeps loader data following the language, and it has to be a subscription
   * rather than a line in the switcher's click handler: `changeLanguage` can be
   * called from anywhere — the header today, a settings screen tomorrow — while
   * only the router can re-run a loader, and a shared `~/components` control has
   * no business reaching for it.
   *
   * What goes stale without this is the tab. `<html lang>` and the tree read the
   * live instance, but a `meta` function runs outside React and can only read
   * `matches[0].loaderData` (see `~/routes/home`), which was written once, by
   * this request's `middleware`. Switching language re-renders `<Meta />` with
   * the SAME frozen language, so the body turns English while the title stays
   * Vietnamese until the next navigation. The detector writes the new cookie
   * synchronously inside `changeLanguage`, before this event fires, so the
   * revalidation's own request already carries it and `middleware` re-decides
   * from the value the visitor just chose.
   */
  useEffect(() => {
    i18n.on("languageChanged", revalidate);

    return () => {
      i18n.off("languageChanged", revalidate);
    };
  }, [i18n, revalidate]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  /*
   * A `Response` thrown by the framework (a 404, a 405) carries its own status
   * line and its own message, so it renders through the shared anatomy directly.
   * Anything else is a crash, and that screen is `~/components/exception` like
   * every other exception screen in this workspace — same three catalogue keys
   * and the same reload affordance as the other two Templates, rather than a
   * fourth hand-rolled 500 page living in the route tree.
   *
   * The `<main>` is here rather than inside `ExceptionState`: this boundary
   * replaces the whole shell, so it is the only thing left to carry the
   * landmark, while the same component used under the shell (#85's 404) is
   * already inside `BodyTemplate`'s `<main>`.
   */
  if (!isRouteErrorResponse(error)) {
    return (
      <main>
        <InternalServerError />
      </main>
    );
  }

  return (
    <main>
      <ExceptionState
        fullscreen
        title={`${error.status} ${error.statusText}`}
        message={typeof error.data === "string" ? error.data : error.statusText}
      />
    </main>
  );
}
