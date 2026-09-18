import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import {
  clampPage,
  getPageItems,
  getTotalPages,
  PAGE_SIZE_OPTIONS,
} from "~/utils/pagination";

interface PaginationBarProps {
  totalItems: number;
  /** 1-based; clamped here, so the caller may hand over a raw URL value. */
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Replaces the "Hiển thị x–y / n" readout while rows are selected. */
  selectedCount?: number;
}

/**
 * The one pagination bar (spec #127 folded the prototype's two into it):
 * a range readout, the page-size select, numbered pages with an ellipsis, and
 * first/prev/next/last.
 */
export function PaginationBar({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
}: PaginationBarProps) {
  const totalPages = getTotalPages(totalItems, pageSize);
  const page = clampPage(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
      <p className="text-muted-foreground flex-1 text-sm">
        {selectedCount > 0 ? (
          <>
            Đã chọn{" "}
            <span className="text-foreground font-medium">{selectedCount}</span>
            {" / "}
            <span className="text-foreground font-medium">{totalItems}</span>{" "}
            dòng
          </>
        ) : (
          <>
            Hiển thị{" "}
            <span className="text-foreground font-medium">
              {startItem}–{endItem}
            </span>
            {" / "}
            <span className="text-foreground font-medium">{totalItems}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            Hiển thị:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              size="sm"
              aria-label="Số dòng mỗi trang"
              className="w-18"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label="Phân trang" className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Trang đầu"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Trang trước"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
          {getPageItems(page, totalPages).map((item, index, items) =>
            item === "ellipsis" ? (
              // At most two ellipses, each after a distinct page number.
              <span
                key={`ellipsis-after-${items[index - 1]}`}
                className="text-muted-foreground flex size-8 items-center justify-center text-xs"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "outline"}
                size="icon-sm"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Trang ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Trang sau"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Trang cuối"
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight />
          </Button>
        </nav>
      </div>
    </div>
  );
}
