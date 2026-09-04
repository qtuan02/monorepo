import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

import { ExceptionState } from "~/components/exception/exception-state";

/**
 * What `root.tsx`'s `ErrorBoundary` renders once the tree has thrown for a
 * reason that is not a `Response` — the 500 screen, in the same three keys the
 * other two Templates use.
 *
 * A full reload rather than a retry: at this point the app's state is of unknown
 * validity, so re-rendering the same tree tends to throw straight back. In this
 * Runtime the reload also costs nothing extra, because the server renders the
 * screen again from scratch.
 *
 * It reads the translation off the instance in scope — the request's clone on
 * the server (`entry.server` wraps `<ServerRouter>` from outside, so the
 * provider is still above this boundary), the singleton in the browser.
 */
export default function InternalServerError() {
  const { t } = useTranslation();

  return (
    <ExceptionState
      fullscreen
      title={t("internalServerError.title")}
      message={t("internalServerError.message")}
      action={
        <Button className="mt-2" onClick={() => window.location.reload()}>
          {t("internalServerError.reload")}
        </Button>
      }
    />
  );
}
