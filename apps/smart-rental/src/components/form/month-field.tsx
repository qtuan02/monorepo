import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";

import { MonthPicker } from "~/components/form/month-picker";

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
 * One labelled `MonthPicker` bound to the form — the Controller + Field
 * anatomy `DateField` writes for `DatePicker`, here over a kỳ value
 * (`YYYY-MM`, spec #153 §3.5) — never the browser's `<input type="month">`,
 * which reads "September 2026".
 */
export function MonthField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  label,
  required,
  placeholder,
}: MonthFieldProps<TValues, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
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
            <MonthPicker
              id={field.name}
              value={field.value as string | undefined}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
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
