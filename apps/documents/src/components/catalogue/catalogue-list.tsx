import type { ReactNode } from "react";
import { useState } from "react";

import { useDebounce } from "@monorepo/hook/use-debounce";

import type { DocsEntry } from "~/types/docs-catalogue";
import { ListHeader } from "~/components/page/list-header";
import { FilterEmpty } from "~/components/search/filter-empty";
import { FilterInput } from "~/components/search/filter-input";
import { filterCatalogue } from "~/utils/filter-catalogue";

/** Filtering a list already in memory settles after a pause, not per keystroke. */
const FILTER_DEBOUNCE_MS = 300;

interface CatalogueListProps<TEntry extends DocsEntry> {
  title: string;
  description: string;
  items: readonly TEntry[];
  /** The count beside the filter, already localised — "12 component". */
  countLabel: (count: number) => string;
  /** One tile per entry; the slice decides what a tile of its kind shows. */
  renderTile: (entry: TEntry) => ReactNode;
}

/**
 * Both list pages (glossary: *Catalogue*): the head with its filter and count,
 * then either the 1/2/4 grid of tiles or the empty state. The input binds to
 * `search` so typing never lags; only the value that drives the filter is
 * debounced (see patterns-debounce-search-input). The tile is a render prop
 * because a shared component may not import a slice's tile itself.
 */
export function CatalogueList<TEntry extends DocsEntry>({
  title,
  description,
  items,
  countLabel,
  renderTile,
}: CatalogueListProps<TEntry>) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, FILTER_DEBOUNCE_MS);

  const filtered = filterCatalogue(items, debouncedSearch);

  return (
    <>
      <ListHeader title={title} description={description}>
        <div className="flex flex-wrap items-center gap-3">
          <FilterInput value={search} onValueChange={setSearch} />
          <p className="text-muted-foreground text-sm tabular-nums">
            {countLabel(filtered.length)}
          </p>
        </div>
      </ListHeader>

      {filtered.length === 0 ? (
        <FilterEmpty query={debouncedSearch} onClear={() => setSearch("")} />
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(renderTile)}
        </ul>
      )}
    </>
  );
}
