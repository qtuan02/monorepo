import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import dayjs from "@monorepo/dayjs";
import { DatePicker } from "@monorepo/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";

interface DateFieldProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> {
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * One labelled `DatePicker` bound to the form — the Controller + Field anatomy
 * `TextField` writes for `Input`, here over a value that round-trips as ISO
 * `YYYY-MM-DD` (what `<input type="date">` used to hand over) while the
 * trigger always reads `DATE_FORMAT` (`DatePicker`'s own default).
 */
export function DateField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  label,
  required,
  placeholder,
  disabled,
}: DateFieldProps<TValues, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorId = fieldState.invalid ? `${field.name}-error` : undefined;
        const value =
          typeof field.value === "string" && field.value
            ? dayjs(field.value as string).toDate()
            : undefined;

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
            <DatePicker
              id={field.name}
              value={value}
              onValueChange={(date) =>
                field.onChange(date ? dayjs(date).format("YYYY-MM-DD") : "")
              }
              onBlur={field.onBlur}
              placeholder={placeholder ?? "Chọn ngày"}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              aria-describedby={errorId}
            />
            {fieldState.invalid && (
              <FieldError id={errorId} errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}
