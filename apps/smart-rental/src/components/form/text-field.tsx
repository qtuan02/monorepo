import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";

interface TextFieldProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> extends Omit<ComponentProps<typeof Input>, "name" | "id"> {
  /** The form's control; a Zod form has an input shape and a parsed one, so both are named. */
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  label: string;
  description?: string;
}

/**
 * One labelled `Input` bound to the form: the `Controller` + `Field` anatomy
 * every text-like input in the Portal takes (see forms-field-components.md),
 * written once. `type`, `placeholder`, `min`, … pass through to the `Input`.
 */
export function TextField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  label,
  description,
  ...inputProps
}: TextFieldProps<TValues, TTransformed>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            id={field.name}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
