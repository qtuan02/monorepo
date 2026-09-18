import { useTranslations } from "next-intl";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ExceptionState } from "~/components/exception/exception-state";
import { ROUTES } from "~/constants/routes";
import { Link } from "~/i18n/navigation";

/**
 * Rendered by `app/[locale]/(shell)/not-found.tsx`, which Next reaches through
 * the catch-all route — and which answers with a real 404 status, not a 200 page
 * that merely says 404.
 *
 * It is the boundary for `notFound()` thrown *below* the shell layout, which is
 * every route in the app but one: `app/[locale]/layout.tsx` also calls
 * `notFound()` for an unreadable locale, and it owns `<html>`, so its boundary
 * is the app root's rather than anything in this tree. That case still answers
 * 404, but with Next's own unstyled English page. See the note in
 * `app/[locale]/layout.tsx`.
 *
 * A Server Component: `useTranslations` reads the request config next-intl
 * already resolved, so no JavaScript ships for this screen.
 */
export default function NotFound() {
  const t = useTranslations();

  return (
    <ExceptionState
      title={t("notFound.title")}
      message={t("notFound.message")}
      action={
        // A `Link` styled with `buttonVariants`, not wrapped in `Button`: Base
        // UI's Button assumes a native <button>, and telling it otherwise
        // stamps role="button" over the anchor's link role. This navigates, so
        // it stays a link.
        <Link href={ROUTES.HOME} className={cn(buttonVariants(), "mt-4")}>
          {t("notFound.backToHome")}
        </Link>
      }
    />
  );
}
