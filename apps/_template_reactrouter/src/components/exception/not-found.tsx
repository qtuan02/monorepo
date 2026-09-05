import { useTranslation } from "react-i18next";
import { href, Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ExceptionState } from "~/components/exception/exception-state";

/**
 * The localized 404 screen, rendered INSIDE the shell so the way out is still
 * on screen. Two routes reach it, and both answer with a real 404 status
 * rather than a 200 page that merely says 404:
 *
 * - the catch-all splat (`~/routes/not-found`), whose loader RETURNS
 *   `data(null, { status: 404 })` — the component is the screen;
 * - `/modules/:slug` for a slug the catalogue does not know, whose loader
 *   THROWS the same and whose own `ErrorBoundary` renders this — root's
 *   boundary replaces the shell, which is why the route keeps its own.
 *
 * Not `fullscreen`: `BodyTemplate`'s `<main>` is already around it.
 *
 * It reads the translation off the instance in scope — the request's clone on
 * the server, the singleton in the browser — so the 404 is in the visitor's
 * language without this file knowing how that was decided.
 */
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <ExceptionState
      title={t("notFound.title")}
      message={t("notFound.message")}
      action={
        // A `Link` styled with `buttonVariants`, not wrapped in `Button`: Base
        // UI's Button assumes a native <button>, and telling it otherwise
        // stamps role="button" over the anchor's link role. This navigates, so
        // it stays a link. `href("/")` rather than a literal: the route table
        // is `src/routes.ts`, and typegen makes a renamed route a compile error.
        <Link to={href("/")} className={cn(buttonVariants(), "mt-4")}>
          {t("notFound.backToHome")}
        </Link>
      }
    />
  );
}
