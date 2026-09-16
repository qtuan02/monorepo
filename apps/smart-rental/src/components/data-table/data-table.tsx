import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

import type {
  DataTableColumnDef,
  DataTableInstance,
  DataTableRowData,
} from "@monorepo/ui/components/data-table";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  DataTableContent,
  useDataTable,
} from "@monorepo/ui/components/data-table";

import type { FilterOption } from "~/constants/status";
import { FacetedFilter } from "~/components/data-table/faceted-filter";
import { PaginationBar } from "~/components/data-table/pagination-bar";
import { SearchInput } from "~/components/data-table/search-input";
import { useTableSearchParams } from "~/components/data-table/use-table-search-params";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { clampPage } from "~/utils/pagination";

/**
 * The filter a facet column opts into: the row's value is one of the selected
 * values. Set it as `filterFn` on every column named in `facets`.
 */
export function facetFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: unknown,
): boolean {
  return Array.isArray(filterValue)
    ? filterValue.includes(row.getValue(columnId))
    : true;
}

interface DataTableFacet {
  /** The column id, which is also the URL key. */
  columnId: string;
  title: string;
  options: FilterOption[];
}

interface DataTableProps<TData extends DataTableRowData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  /** Free-text search over one column, with `filterFn: "includesString"` set on it. */
  search?: { columnId: string; placeholder: string };
  facets?: DataTableFacet[];
  empty: { icon?: LucideIcon; title: string; description?: string };
  /** "45 phòng được tìm thấy" — built from the filtered count. */
  resultLabel?: (filteredCount: number) => string;
  /** Controls at the right end of the result line (a grid/table switch). */
  viewSwitch?: ReactNode;
  /** Controls at the right end of the filter toolbar. */
  toolbarActions?: ReactNode;
  /** An alternative body over the same filtered, sorted, paged rows (a card grid). */
  renderRows?: (rows: TData[], table: DataTableInstance<TData>) => ReactNode;
}

/**
 * The list composite every slice stands on (spec #127): search, faceted
 * filters, sort, page and page size over one TanStack instance from the
 * `data-table` primitive. Search, facets, page and size live on the URL — a
 * reload or a shared link lands on the same view — while sort and row
 * selection stay in the table.
 */
export function DataTable<TData extends DataTableRowData>({
  columns,
  data,
  getRowId,
  search,
  facets = [],
  empty,
  resultLabel,
  viewSwitch,
  toolbarActions,
  renderRows,
}: DataTableProps<TData>) {
  const facetIds = facets.map((facet) => facet.columnId);
  const { params, setParams } = useTableSearchParams(facetIds);

  const columnFilters = [
    ...(search && params.search
      ? [{ id: search.columnId, value: params.search }]
      : []),
    ...facetIds
      .filter((id) => params.facets[id]?.length)
      .map((id) => ({ id, value: params.facets[id] })),
  ];
  const pagination = {
    pageIndex: params.page - 1,
    pageSize: params.pageSize,
  };

  const table = useDataTable<TData>({
    columns,
    data,
    getRowId,
    state: { columnFilters, pagination },
    // The URL owns the page, so a filter change resets it below rather than
    // through TanStack, whose auto-reset fires on any row-model recompute.
    autoResetPageIndex: false,
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const filterValueOf = (id: string) =>
        next.find((f) => f.id === id)?.value;
      const nextFacets: Record<string, string[]> = {};
      for (const id of facetIds) {
        const value = filterValueOf(id);
        nextFacets[id] = Array.isArray(value) ? value.map(String) : [];
      }
      setParams({
        search: search
          ? String(filterValueOf(search.columnId) ?? "")
          : undefined,
        facets: nextFacets,
        page: 1,
      });
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const rows = table.getRowModel().rows;
  const selectedCount = Object.keys(table.state.rowSelection ?? {}).length;
  const isFiltering = columnFilters.length > 0;

  // A `?page=` past the last page (a stale link, a shorter list after a
  // filter) is corrected in the URL, the external system that owns it.
  useEffect(() => {
    const safePage = clampPage(params.page, pageCount);
    if (safePage !== params.page) setParams({ page: safePage });
  }, [params.page, pageCount, setParams]);

  // Counts per option over the whole scoped list, not the filtered one, so a
  // facet still shows what selecting it would reveal.
  const countsFor = (columnId: string) => {
    const counts = new Map<string, number>();
    for (const row of table.getCoreRowModel().rows) {
      const value = String(row.getValue(columnId));
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
  };

  return (
    <div className="space-y-4">
      {(resultLabel || viewSwitch) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {resultLabel && (
              <span className="text-muted-foreground text-sm font-medium">
                {resultLabel(filteredCount)}
              </span>
            )}
            {isFiltering && <Badge variant="secondary">Đang lọc</Badge>}
          </div>
          {viewSwitch}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {search && (
            <SearchInput
              value={params.search}
              placeholder={search.placeholder}
              onChange={(value) =>
                table
                  .getColumn(search.columnId)
                  ?.setFilterValue(value || undefined)
              }
            />
          )}
          {facets.map((facet) => (
            <FacetedFilter
              key={facet.columnId}
              title={facet.title}
              options={facet.options}
              selected={params.facets[facet.columnId] ?? []}
              counts={countsFor(facet.columnId)}
              onChange={(values) =>
                table
                  .getColumn(facet.columnId)
                  ?.setFilterValue(values.length ? values : undefined)
              }
            />
          ))}
          {isFiltering && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
            >
              Xóa bộ lọc
              <X />
            </Button>
          )}
        </div>
        {toolbarActions && (
          <div className="flex items-center gap-2">{toolbarActions}</div>
        )}
      </div>

      {filteredCount === 0 ? (
        <EmptyPanel
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={
            isFiltering
              ? {
                  label: "Xóa toàn bộ bộ lọc",
                  onClick: () => table.resetColumnFilters(),
                }
              : undefined
          }
          className="border"
        />
      ) : renderRows ? (
        renderRows(
          rows.map((row) => row.original),
          table,
        )
      ) : (
        <DataTableContent table={table} className="bg-card shadow-sm" />
      )}

      {filteredCount > 0 && (
        <PaginationBar
          totalItems={filteredCount}
          currentPage={params.page}
          pageSize={params.pageSize}
          selectedCount={selectedCount}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
        />
      )}
    </div>
  );
}
