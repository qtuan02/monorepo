import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
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

interface MonthFieldControlField {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

interface MonthFieldControlFieldState {
  invalid: boolean;
  error?: { message?: string };
}

interface MonthFieldControlProps {
  field: MonthFieldControlField;
  fieldState: MonthFieldControlFieldState;
  label: string;
  required?: boolean;
  placeholder: string;
}

// A separate module-level component (not inline in MonthField) so its own
// open/viewYear state does not get torn down every parent render.
function MonthFieldControl({
  field,
  fieldState,
  label,
  required,
  placeholder,
}: MonthFieldControlProps) {
  const [open, setOpen] = useState(false);
  const selectedYear = field.value
    ? Number(field.value.slice(0, 4))
    : undefined;
  const selectedMonth = field.value
    ? Number(field.value.slice(5, 7))
    : undefined;
  const [viewYear, setViewYear] = useState(
    () => selectedYear ?? new Date().getFullYear(),
  );
  const errorId = fieldState.invalid ? `${field.name}-error` : undefined;

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={field.name}
              type="button"
              variant="outline"
              data-empty={!field.value}
              className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
              aria-invalid={fieldState.invalid}
              aria-describedby={errorId}
              onBlur={field.onBlur}
            />
          }
        >
          <CalendarIcon />
          {field.value ? formatMonth(field.value) : placeholder}
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
                    field.onChange(
                      `${viewYear}-${String(month).padStart(2, "0")}`,
                    );
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
      {fieldState.invalid && (
        <FieldError id={errorId} errors={[fieldState.error]} />
      )}
    </Field>
  );
}

interface MonthFieldProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> {
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  placeholder?: string;
}

/**
 * A kỳ picker: a popover over a 12-cell month grid with year navigation
 * either side, value `YYYY-MM`, display `MM/YYYY` (spec #153 §3.5) — never
 * the browser's `<input type="month">`, which reads "September 2026".
 */
export function MonthField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  label,
  required,
  placeholder = "Chọn kỳ",
}: MonthFieldProps<TValues, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MonthFieldControl
          field={field}
          fieldState={fieldState}
          label={label}
          required={required}
          placeholder={placeholder}
        />
      )}
    />
  );
}
