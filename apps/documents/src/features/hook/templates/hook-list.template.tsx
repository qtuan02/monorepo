import { useTranslation } from "react-i18next";

import { CatalogueList } from "~/components/catalogue/catalogue-list";
import { hookCatalogue } from "~/constants/docs-catalogue";
import { useDocumentTitle } from "~/hooks/use-document-title";
import HookTile from "../components/hook-tile";

export default function HookListTemplate() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.hooks.title"));

  return (
    <CatalogueList
      title={t("documents.hooks.title")}
      description={t("documents.hooks.description", {
        count: hookCatalogue.items.length,
      })}
      items={hookCatalogue.items}
      countLabel={(count) => t("documents.hooks.count", { count })}
      renderTile={(entry) => <HookTile key={entry.slug} entry={entry} />}
    />
  );
}
