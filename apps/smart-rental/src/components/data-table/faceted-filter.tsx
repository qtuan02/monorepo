import { useId } from "react";
import { PlusCircle } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";
import { Separator } from "@monorepo/ui/components/separator";
import { cn } from "@monorepo/ui/utils/cn";

import type { FilterOption } from "~/constants/status";

interface FacetedFilterProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  /** Rows per option value, shown beside the label. */
  counts?: Map<string, number>;
}

/** A multi-select over a fixed option list, in a popover behind a dashed button. */
export function FacetedFilter({
  title,
  options,
  selected,
  onChange,
  counts,
}: FacetedFilterProps) {
  const idPrefix = useId();
  const selectedSet = new Set(selected);

  const toggle = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next]);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-dashed"
          >
            <PlusCircle />
            {title}
            {selectedSet.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedSet.size}
                </Badge>
                <div className="hidden gap-1 lg:flex">
                  {selectedSet.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedSet.size} đã chọn
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedSet.has(option.value))
                      .map((option) => (
                        <Badge
                          key={option.value}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-52 p-0" align="start">
        <div className="p-2">
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            {title}
          </p>
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = selectedSet.has(option.value);
              const Icon = option.icon;
              return (
                // A <label> around the primitive: the whole row toggles, and the
                // label text is the checkbox's accessible name.
                <label
                  key={option.value}
                  htmlFor={`${idPrefix}-${option.value}`}
                  className={cn(
                    "hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isSelected && "bg-accent",
                  )}
                >
                  <Checkbox
                    id={`${idPrefix}-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {Icon && <Icon className="text-muted-foreground size-4" />}
                  <span className="flex-1 text-left">{option.label}</span>
                  {counts?.get(option.value) !== undefined && (
                    <span className="ml-auto font-mono text-xs">
                      {counts.get(option.value)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        {selectedSet.size > 0 && (
          <>
            <Separator />
            <div className="p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange([])}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
