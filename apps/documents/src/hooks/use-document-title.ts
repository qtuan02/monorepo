import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Sets `document.title` for the page that calls it.
 *
 * A genuine `useEffect`: the document title is an external system React does
 * not own, which is one of the few things the hook is actually for (see
 * react-effects-sync-only). Every route calls it — the shell deliberately does
 * not, because a parent's effect runs *after* its children's and would
 * overwrite whatever the page had just set.
 */
export function useDocumentTitle(page: string): void {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("documents.meta.pageTitle", { page });
  }, [t, page]);
}
