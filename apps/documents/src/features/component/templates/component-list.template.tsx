import { useTranslation } from "react-i18next";

import { CatalogueList } from "~/components/catalogue/catalogue-list";
import { componentCatalogue } from "~/constants/docs-catalogue";
import { useDocumentTitle } from "~/hooks/use-document-title";
import ComponentTile from "../components/component-tile";

export default function ComponentListTemplate() {
  const { t } = useTranslation();

  useDocumentTitle(t("documents.components.title"));

  return (
    <CatalogueList
      title={t("documents.components.title")}
      description={t("documents.components.description")}
      items={componentCatalogue.items}
      countLabel={(count) => t("documents.components.count", { count })}
      // The slug is unique within the catalogue, so it is the stable key.
      renderTile={(entry) => <ComponentTile key={entry.slug} entry={entry} />}
    />
  );
}
