import { useTranslation } from "react-i18next";

import NotFound from "~/components/exception/not-found";
import { useDocumentTitle } from "~/hooks/use-document-title";

/**
 * The catch-all route. It exists so the 404 owns its own document title the
 * same way every real page does — the shared exception component is presentation
 * only and takes no view of the browser tab.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.notFound.title"));

  return <NotFound />;
}
