import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useDebounce } from "@monorepo/hook/use-debounce";

import { PageHeader } from "~/components/page/page-header";
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
      <PageHeader
        title={t("documents.hooks.title")}
        description={t("documents.hooks.description")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 py-6">
        <FilterInput value={search} onValueChange={setSearch} />
        <p className="text-muted-foreground text-sm tabular-nums">
          {t("documents.hooks.count", { count: items.length })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          {t("documents.search.empty", { query: debouncedSearch })}
        </p>
      ) : (
        <ul className="grid gap-3 pb-10 sm:grid-cols-2">
          {items.map((entry) => (
            <li key={entry.slug}>
              <HookCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
