import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Fragment, useEffect } from "react";
import { X } from "lucide-react";

import type {
  DataTableColumnDef,
  DataTableInstance,
  DataTableRowData,
} from "@monorepo/ui/components/data-table";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  createDataTableColumnHelper,
  DataTableContent,
  useDataTable,
} from "@monorepo/ui/components/data-table";

import type { ListView } from "~/components/data-table/list-view";
import type { TableSort } from "~/components/data-table/use-table-search-params";
import type { FilterOption } from "~/constants/status";
import { FacetedFilter } from "~/components/data-table/faceted-filter";
import { ListViewSwitch, useListView } from "~/components/data-table/list-view";
import { PaginationBar } from "~/components/data-table/pagination-bar";
import { SearchInput } from "~/components/data-table/search-input";
import { SelectionBar } from "~/components/data-table/selection-bar";
import { useTableSearchParams } from "~/components/data-table/use-table-search-params";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { ErrorPanel } from "~/components/panel/error-panel";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "~/components/panel/loading-panel";
import { clampPage } from "~/utils/pagination";

const FILTER_EMPTY_DESCRIPTION =
  "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả.";

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

/**
 * A checkbox column for row selection, auto-prepended by `DataTable` itself
 * whenever `selectionActions` is given — a caller never lists it among its
 * own `columns` (spec #221 T2: a hand-copied one with no `selectionActions`
 * behind it is a dead checkbox, the bug this fixes on Rooms/Hợp đồng). Header
 * toggles every row on the current page; `stopPropagation` keeps a click on
 * the box itself from also triggering a row-level click handler a caller may
 * add.
 */
function createSelectionColumn<
  TData extends DataTableRowData,
>(): DataTableColumnDef<TData> {
  const helper = createDataTableColumnHelper<TData>();
  return helper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        onClick={(event) => event.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Chọn dòng"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(event) => event.stopPropagation()}
      />
    ),
    enableSorting: false,
  });
}

interface DataTableFacet {
  /** The column id, which is also the URL key. */
  columnId: string;
  title: string;
  options: FilterOption[];
}

/**
 * The shape `DataTable` reads off a TanStack Query result — a real
 * `useQuery`/`useGetXxx()` return satisfies this structurally, with no cast
 * needed, and so does a hand-built stand-in for data a caller already
 * resolved itself (e.g. one Toà nhà's slice of an outer query).
 */
export interface DataTableQuery<TData> {
  data: TData[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

interface DataTableProps<TData extends DataTableRowData> {
  columns: DataTableColumnDef<TData>[];
  query: DataTableQuery<TData>;
  getRowId: (row: TData) => string;
  /** Free-text search over one column, with `filterFn: "includesString"` set on it. */
  search?: { columnId: string; placeholder: string };
  facets?: DataTableFacet[];
  empty: { icon?: LucideIcon; title: string };
  /** "phòng" → "45 phòng được tìm thấy", built from the filtered count. Omit for no result line. */
  entityLabel?: string;
  /**
   * Controls at the right end of the filter toolbar. A function is handed
   * the filtered (pre-pagination) rows — "các hàng đang lọc" — for a CSV
   * export button that must export exactly what search/facets narrowed to.
   */
  toolbarActions?: ReactNode | ((filteredRows: TData[]) => ReactNode);
  /**
   * One row as a card — `DataTable` wraps every visible row's card in the
   * shared `sm:grid-cols-2 lg:grid-cols-3` grid itself once the view switches
   * to "Dạng thẻ". Giving either this or `renderRows` turns the switch on.
   */
  card?: (row: TData) => ReactNode;
  /**
   * An alternative body over the whole filtered+sorted set (the Phòng floor
   * grid) — kept for a grid that is not a plain one-card-per-row mapping.
   * Pagination auto-disables while this is the view showing, since a floor
   * grid must show its whole scope at once.
   */
  renderRows?: (rows: TData[], table: DataTableInstance<TData>) => ReactNode;
  /**
   * A row's mobile substitute (`~/components/data-table/item.tsx` shape) —
   * only reached when the table itself is showing (neither `card` nor
   * `renderRows` is the current view), since a card grid already stacks to
   * one column on its own.
   */
  renderMobileRow?: (row: TData) => ReactNode;
  /**
   * The selection bar's action buttons, given the selected rows and a
   * function to clear the selection. Given this, `DataTable` prepends its own
   * selection column — nothing is ever selectable without it.
   */
  selectionActions?: (
    selectedRows: TData[],
    clearSelection: () => void,
  ) => ReactNode;
  /**
   * `false` shows the whole filtered+sorted set with no `PaginationBar`, for
   * a screen with no card/table switch at all (a report's period rows).
   * Ignored (forced off) while `renderRows` is the view showing. Default `true`.
   */
  paginate?: boolean;
  /** The view "Dạng thẻ"/"Dạng bảng" opens on, while `card` or `renderRows` is given. Default `"table"`. */
  defaultView?: ListView;
  /**
   * The list's own order (spec #179 §3.6) — a column id the columns carry,
   * ascending unless `desc`. Applied until a header is clicked; clicking back
   * to it drops the URL's `?sort=` again rather than writing it out.
   */
  defaultSort?: Pick<TableSort, "columnId"> & Partial<Pick<TableSort, "desc">>;
}

/**
 * The list composite every slice stands on (spec #127): search, faceted
 * filters, sort, page and page size over one TanStack instance from the
 * `data-table` primitive, plus the query's own loading/error/empty states
 * (spec #221 T2 — merged in from the now-deleted `QuerySection`). Search,
 * facets, page, size, sort and the card/table view all live on the URL — a
 * reload or a shared link lands on the same view — while row selection stays
 * in the table.
 */
export function DataTable<TData extends DataTableRowData>({
  columns,
  query,
  getRowId,
  search,
  facets = [],
  empty,
  entityLabel,
  toolbarActions,
  card,
  renderRows,
  renderMobileRow,
  selectionActions,
  defaultSort,
  paginate = true,
  defaultView = "table",
}: DataTableProps<TData>) {
  const data = query.data ?? [];
  const effectiveColumns = selectionActions
    ? [createSelectionColumn<TData>(), ...columns]
    : columns;
  const hasAltView = !!(card || renderRows);

  const facetIds = facets.map((facet) => facet.columnId);
  const { params, setParams } = useTableSearchParams(
    facetIds,
    defaultSort
      ? { columnId: defaultSort.columnId, desc: !!defaultSort.desc }
      : null,
  );
  // Called unconditionally (Rules of Hooks) even when no card/renderRows is
  // given — the switch itself only renders while `hasAltView` is true.
  const [view, setView] = useListView(defaultView);

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
  const sorting = params.sort
    ? [{ id: params.sort.columnId, desc: params.sort.desc }]
    : [];

  const table = useDataTable<TData>({
    columns: effectiveColumns,
    data,
    getRowId,
    state: { columnFilters, pagination, sorting },
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
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      setParams({
        sort: first ? { columnId: first.id, desc: first.desc } : null,
      });
    },
  });

  const showingGrid = hasAltView && view === "grid";
  // A floor/custom grid must show its whole scope at once; a plain card grid
  // still paginates like the table does.
  const effectivePaginate = showingGrid && renderRows ? false : paginate;

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  const toolbar =
    typeof toolbarActions === "function"
      ? toolbarActions(filteredRows.map((row) => row.original))
      : toolbarActions;
  const pageCount = table.getPageCount();
  // Filtered + sorted, pre-pagination — what `effectivePaginate === false` shows in full.
  const rows = effectivePaginate
    ? table.getRowModel().rows
    : table.getSortedRowModel().rows;
  const selectedCount = Object.keys(table.state.rowSelection ?? {}).length;
  const isFiltering = columnFilters.length > 0;

  // A `?page=` past the last page (a stale link, a shorter list after a
  // filter) is corrected in the URL, the external system that owns it —
  // moot while the whole set is already on screen.
  useEffect(() => {
    if (!effectivePaginate) return;
    const safePage = clampPage(params.page, pageCount);
    if (safePage !== params.page) setParams({ page: safePage });
  }, [effectivePaginate, params.page, pageCount, setParams]);

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

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <TableSkeleton columnCount={effectiveColumns.length} />
        </div>
        <div className="md:hidden">
          <CardGridSkeleton />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorPanel
        description={
          entityLabel
            ? `Không tải được danh sách ${entityLabel}.`
            : "Không tải được dữ liệu."
        }
        action={{ label: "Thử lại", onClick: () => void query.refetch() }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {(entityLabel || hasAltView) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {entityLabel && (
              <span className="text-muted-foreground text-sm font-medium">
                {filteredCount} {entityLabel} được tìm thấy
              </span>
            )}
            {isFiltering && <Badge variant="secondary">Đang lọc</Badge>}
          </div>
          {hasAltView && <ListViewSwitch view={view} onViewChange={setView} />}
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
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      {filteredCount === 0 ? (
        <EmptyPanel
          icon={empty.icon}
          title={empty.title}
          description={FILTER_EMPTY_DESCRIPTION}
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
      ) : showingGrid ? (
        renderRows ? (
          renderRows(
            rows.map((row) => row.original),
            table,
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <Fragment key={getRowId(row.original)}>
                {card?.(row.original)}
              </Fragment>
            ))}
          </div>
        )
      ) : renderMobileRow ? (
        <>
          <div className="hidden md:block">
            <DataTableContent table={table} className="bg-card shadow-sm" />
          </div>
          <div className="grid gap-2 md:hidden">
            {rows.map((row) => (
              <div key={row.id} data-slot="data-table-mobile-row">
                {renderMobileRow(row.original)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <DataTableContent table={table} className="bg-card shadow-sm" />
      )}

      {selectionActions && selectedCount > 0 && (
        <SelectionBar
          selectedCount={selectedCount}
          onClear={() => table.resetRowSelection()}
          actions={selectionActions(
            table.getSelectedRowModel().rows.map((row) => row.original),
            () => table.resetRowSelection(),
          )}
        />
      )}

      {filteredCount > 0 && effectivePaginate && (
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
