import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@monorepo/ui/components/empty";

import { ROUTES } from "~/constants/routes";

interface NotFoundProps {
  /** Overrides for a 404 that knows what was missing — an unknown slug, say. */
  title?: string;
  message?: string;
}

/**
 * The 404 screen, on the `Empty` primitive so it paints with the app's tokens
 * in both themes — the Template's version drew its own greys and a white pill,
 * which read the same in the dark theme. The way out is a `Link` styled with
 * `buttonVariants`, not wrapped in `Button` (see architecture-ui-primitives).
 */
export default function NotFound({ title, message }: NotFoundProps = {}) {
  const { t } = useTranslation();

  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title ?? t("notFound.title")}
        </h1>
        <EmptyDescription className="text-base">
          {message ?? t("notFound.message")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to={ROUTES.HOME} className={buttonVariants()}>
          {t("notFound.backToHome")}
        </Link>
      </EmptyContent>
    </Empty>
  );
}
