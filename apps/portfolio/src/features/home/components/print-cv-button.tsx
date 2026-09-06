"use client";

import { PrinterIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";

/**
 * The hero's fourth quick action, and the only one that is not a link.
 *
 * This page *is* the CV — there is no PDF to keep in step with it — so
 * "download my CV" is answered by the browser's own print dialog over a
 * stylesheet that opens every folded row. A real `<button>`, not a link
 * dressed as one: printing acts on the page in front of you rather than
 * leading anywhere, and `Button` is right here for the same reason
 * `buttonVariants` is right on the three links beside it.
 *
 * It is the one client island in the hero that exists for its handler; the
 * rest of the section renders on the server.
 */
export default function PrintCvButton() {
  const t = useTranslations();

  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <PrinterIcon aria-hidden="true" className="size-4" />
      {t("portfolio.hero.actions.print")}
    </Button>
  );
}
