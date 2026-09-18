import type { ComponentProps } from "react";
import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";

import { formatMonth } from "~/utils/date";

const MONTH_LABELS = Array.from(
  { length: 12 },
  (_, index) => `Th ${index + 1}`,
);

interface MonthPickerProps
  extends Pick<
    ComponentProps<"button">,
    "id" | "onBlur" | "aria-invalid" | "aria-describedby" | "aria-label"
  > {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * The presentational half of `~/components/form/month-field.tsx` — a popover
 * over a 12-cell month grid with year navigation either side, value
 * `YYYY-MM`, display `MM/YYYY` (spec #153 §3.5). `MonthField` wraps this in a
 * `Controller` + `Field` for an RHF form; `~/features/reconciliation`'s kỳ
 * selector uses it bare, with no form around it at all.
 */
export function MonthPicker({
  value,
  onChange,
  placeholder = "Chọn kỳ",
  ...triggerProps
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedYear = value ? Number(value.slice(0, 4)) : undefined;
  const selectedMonth = value ? Number(value.slice(5, 7)) : undefined;
  const [viewYear, setViewYear] = useState(
    () => selectedYear ?? new Date().getFullYear(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            {...triggerProps}
          />
        }
      >
        <CalendarIcon />
        {value ? formatMonth(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Năm trước"
            onClick={() => setViewYear((year) => year - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm font-medium tabular-nums">{viewYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Năm sau"
            onClick={() => setViewYear((year) => year + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MONTH_LABELS.map((monthLabel, index) => {
            const month = index + 1;
            const isSelected =
              selectedYear === viewYear && selectedMonth === month;
            return (
              <Button
                key={monthLabel}
                type="button"
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  onChange(`${viewYear}-${String(month).padStart(2, "0")}`);
                  setOpen(false);
                }}
              >
                {monthLabel}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
