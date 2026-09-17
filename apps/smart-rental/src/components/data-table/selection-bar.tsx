import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

interface SelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions?: ReactNode;
  className?: string;
}

/**
 * A `DataTable`'s row-selection action bar (spec #153 §10 row 178): "Đã chọn
 * n · [hành động] · ✕", sticky to the bottom of the scrolling column.
 * Self-hides at zero, so a `DataTable` can render it unconditionally rather
 * than every caller re-checking `selectedCount`.
 */
export function SelectionBar({
  selectedCount,
  onClear,
  actions,
  className,
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "bg-card border-border sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-md border px-4 py-2.5 shadow-md",
        className,
      )}
    >
      <span className="text-sm font-medium">Đã chọn {selectedCount}</span>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Bỏ chọn"
        className="ml-auto"
        onClick={onClear}
      >
        <X />
      </Button>
    </div>
  );
}
