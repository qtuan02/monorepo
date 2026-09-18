import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@monorepo/ui/components/input-group";

interface CurrencyFieldProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> extends Pick<ComponentProps<"input">, "placeholder" | "min" | "max"> {
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  required?: boolean;
  description?: string;
}

/** One labelled money `Input` — an `InputGroup` with the "đ" suffix, never a bare number field. */
export function CurrencyField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  label,
  required,
  description,
  ...inputProps
}: CurrencyFieldProps<TValues, TTransformed>) {
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
            <InputGroup>
              <InputGroupInput
                {...inputProps}
                {...field}
                id={field.name}
                type="number"
                inputMode="numeric"
                aria-invalid={fieldState.invalid}
                aria-describedby={errorId}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>đ</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && (
              <FieldError id={errorId} errors={[fieldState.error]} />
            )}
          </Field>
        );
      }}
    />
  );
}
