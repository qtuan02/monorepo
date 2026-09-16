import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDebounce } from "@monorepo/hook/use-debounce";

import { ListHeader } from "~/components/page/list-header";
import { FilterEmpty } from "~/components/search/filter-empty";
import { FilterInput } from "~/components/search/filter-input";
import { hookCatalogue } from "~/constants/docs-catalogue";
import { useDocumentTitle } from "~/hooks/use-document-title";
import { filterCatalogue } from "~/utils/filter-catalogue";
import HookCard from "../components/hook-card";

const FILTER_DEBOUNCE_MS = 300;

export default function HookListTemplate() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, FILTER_DEBOUNCE_MS);

  useDocumentTitle(t("documents.hooks.title"));

  const items = filterCatalogue(hookCatalogue.items, debouncedSearch);

  return (
    <>
      <ListHeader
        title={t("documents.hooks.title")}
        description={t("documents.hooks.description")}
      >
        <div className="flex flex-wrap items-center gap-3">
          <FilterInput value={search} onValueChange={setSearch} />
          <p className="text-muted-foreground text-sm tabular-nums">
            {t("documents.hooks.count", { count: items.length })}
          </p>
        </div>
      </ListHeader>

      {items.length === 0 ? (
        <FilterEmpty query={debouncedSearch} onClear={() => setSearch("")} />
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((entry) => (
            <HookCard key={entry.slug} entry={entry} />
          ))}
        </ul>
      )}
    </>
  );
}
