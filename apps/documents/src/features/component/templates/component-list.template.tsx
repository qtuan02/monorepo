import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDebounce } from "@monorepo/hook/use-debounce";

import { ListHeader } from "~/components/page/list-header";
import { FilterEmpty } from "~/components/search/filter-empty";
import { FilterInput } from "~/components/search/filter-input";
import { componentCatalogue } from "~/constants/docs-catalogue";
import { useDocumentTitle } from "~/hooks/use-document-title";
import { filterCatalogue } from "~/utils/filter-catalogue";
import ComponentCard from "../components/component-card";

/** Filtering a list already in memory settles after a pause, not per keystroke. */
const FILTER_DEBOUNCE_MS = 300;

export default function ComponentListTemplate() {
  const { t } = useTranslation();
  // The input binds to `search` so typing never lags; only the value that
  // drives the filter is debounced (see patterns-debounce-search-input).
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, FILTER_DEBOUNCE_MS);

  useDocumentTitle(t("documents.components.title"));

  const items = filterCatalogue(componentCatalogue.items, debouncedSearch);

  return (
    <>
      <ListHeader
        title={t("documents.components.title")}
        description={t("documents.components.description")}
      >
        <div className="flex flex-wrap items-center gap-3">
          <FilterInput value={search} onValueChange={setSearch} />
          <p className="text-muted-foreground text-sm tabular-nums">
            {t("documents.components.count", { count: items.length })}
          </p>
        </div>
      </ListHeader>

      {items.length === 0 ? (
        <FilterEmpty query={debouncedSearch} onClear={() => setSearch("")} />
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((entry) => (
            // The slug is unique within the catalogue, so it is the stable key.
            <ComponentCard key={entry.slug} entry={entry} />
          ))}
        </ul>
      )}
    </>
  );
}
