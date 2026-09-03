"use client";

import type {
  Column,
  ColumnDef,
  RowData,
  Table as TanstackTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";

import { Button } from "#components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/table";
import { cn } from "#utils/cn";

// TanStack Table v9 is feature-based: only what is registered here exists on the
// table instance (and in its state type). One shared registration keeps every
// DataTable in the workspace on the same feature set.
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

type DataTableFeatures = typeof dataTableFeatures;

function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

type DataTableProps<TData extends RowData> = {
  columns: Array<ColumnDef<DataTableFeatures, TData>>;
  data: Array<TData>;
  // Return the row's own identifier (String(row.id)) whenever the data has
  // one — the default falls back to the index, which breaks row state on
  // reorder (see quality-list-keys).
  getRowId?: (row: TData, index: number) => string;
  pageSize?: number;
  emptyMessage?: React.ReactNode;
  toolbar?: (table: TanstackTable<DataTableFeatures, TData>) => React.ReactNode;
  className?: string;
  containerClassName?: string;
};

function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  emptyMessage = "Không có kết quả.",
  toolbar,
  className,
  containerClassName,
}: DataTableProps<TData>) {
  const table = useTable<DataTableFeatures, TData>(
    {
      features: dataTableFeatures,
      columns,
      data,
      getRowId,
      initialState: { pagination: { pageIndex: 0, pageSize } },
    },
    // The table owns its state; selecting the whole state subscribes this
    // component to every sort/filter/page/selection change.
    (state) => state,
  );

  // `initialState` is read once at mount — a later pageSize prop change (a
  // caller resizing its externally-owned page) must be written into the
  // table's own store, which is an external system to React.
  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [table, pageSize]);

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const selectedCount = Object.keys(table.state.rowSelection ?? {}).length;

  return (
    <div
      data-slot="data-table"
      className={cn("flex w-full flex-col gap-3", className)}
    >
      {toolbar?.(table)}
      <div
        className={cn("overflow-hidden rounded-md border", containerClassName)}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(pageCount > 1 || selectedCount > 0) && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedCount > 0 &&
              `Đã chọn ${selectedCount} / ${table.getRowCount()} dòng.`}
          </div>
          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <span className="mr-2 text-sm text-muted-foreground">
                Trang {table.state.pagination.pageIndex + 1} / {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang đầu"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.firstPage()}
              >
                <ChevronsLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang trước"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang sau"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRightIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Trang cuối"
                disabled={!table.getCanNextPage()}
                onClick={() => table.lastPage()}
              >
                <ChevronsRightIcon />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type DataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  className?: string;
};

function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8", className)}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUpIcon />
      ) : sorted === "desc" ? (
        <ArrowDownIcon />
      ) : (
        <ChevronsUpDownIcon />
      )}
    </Button>
  );
}

export {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
  type DataTableFeatures,
  dataTableFeatures,
};
