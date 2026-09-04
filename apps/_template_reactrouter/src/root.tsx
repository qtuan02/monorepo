import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/root";
import stylesheet from "./globals.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "stylesheet", href: stylesheet },
];

/**
 * The document shell. It is a separate export from `App` on purpose: React
 * Router renders `Layout` around whichever of `App`, `ErrorBoundary` or
 * `HydrateFallback` is current, so a thrown error swaps the content without
 * remounting `<html>`.
 *
 * `lang` is the registry's default for now. Negotiating it per request —
 * cookie, then `Accept-Language` — is the i18n ticket's job; it lands here as a
 * `loader` value, and nothing else in this file has to move.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLanguage}>
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
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isResponse = isRouteErrorResponse(error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-3 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isResponse
          ? `${error.status} ${error.statusText}`
          : "Đã có lỗi xảy ra"}
      </h1>
      <p className="text-muted-foreground text-sm">
        {isResponse
          ? error.data
          : "Vui lòng tải lại trang. Nếu lỗi lặp lại, liên hệ bộ phận hỗ trợ."}
      </p>
    </main>
  );
}
