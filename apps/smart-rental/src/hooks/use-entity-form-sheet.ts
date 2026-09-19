import type { DefaultValues, FieldErrors, FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { toast } from "@monorepo/ui/components/toast";

/** The only two members of `UseMutationResult` this hook touches — or any object of this shape. */
interface EntityFormSheetMutation<TResult, TPayload> {
  mutate: (
    payload: TPayload,
    options?: { onSuccess?: (result: TResult) => void },
  ) => void;
  isPending: boolean;
}

interface EntityFormSheetMutations<TResult, TCreatePayload, TUpdatePayload> {
  create?: EntityFormSheetMutation<TResult, TCreatePayload>;
  update?: EntityFormSheetMutation<TResult, TUpdatePayload>;
}

interface UseEntityFormSheetOptions<
  TEntity,
  TInput extends FieldValues,
  TValues extends FieldValues,
  TCreatePayload,
  TUpdatePayload,
  TResult,
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: ZodType<TValues, TInput>;
  /** Present → sửa (calls `mutations.update`); absent → thêm mới (calls `mutations.create`). */
  entity?: TEntity;
  toDefaultValues: (entity: TEntity | undefined) => TInput;
  mutations: EntityFormSheetMutations<TResult, TCreatePayload, TUpdatePayload>;
  /** Defaults to the parsed values themselves when the mutation's variables match the form 1:1. */
  toPayload?: (
    values: TValues,
    entity: TEntity | undefined,
  ) => TCreatePayload | TUpdatePayload;
  successMessage: (result: TResult, entity: TEntity | undefined) => string;
  /** Fires after the toast + reset + close above — e.g. the Hợp đồng wizard's own step 2 selecting a freshly created Người thuê. */
  onSuccess?: (result: TResult, entity: TEntity | undefined) => void;
}

/**
 * Owns a `FormSheet`'s whole lifecycle (spec #221 ticket #4): the form
 * itself, resetting to `toDefaultValues(entity)` on every open, picking
 * `create`/`update` by whether an `entity` was handed in, and the
 * toast + reset + close on a successful save. A sheet keeps only its fields
 * and the entity-specific `toDefaultValues`/`toPayload`/`successMessage`.
 */
export function useEntityFormSheet<
  TEntity,
  TInput extends FieldValues,
  TValues extends FieldValues,
  TCreatePayload = TValues,
  TUpdatePayload = TCreatePayload,
  TResult = TEntity,
>({
  open,
  onOpenChange,
  schema,
  entity,
  toDefaultValues,
  mutations,
  toPayload,
  successMessage,
  onSuccess,
}: UseEntityFormSheetOptions<
  TEntity,
  TInput,
  TValues,
  TCreatePayload,
  TUpdatePayload,
  TResult
>) {
  const formId = useId();
  const form = useForm<TInput, unknown, TValues>({
    resolver: zodResolver<TInput, unknown, TValues>(schema),
    defaultValues: toDefaultValues(entity) as DefaultValues<TInput>,
  });
  const isEdit = !!entity;
  const mutation = isEdit ? mutations.update : mutations.create;

  // Reset only on `open`'s own rising edge — the one correct sync point
  // ([[react-effects-sync-only]]): `open` is the parent's own setState, never
  // routed through FormSheet's `onOpenChange`, so resetting there would never
  // run for a "Thêm"/"Sửa" button that just flips `open` directly.
  // `entity`/`toDefaultValues` are read from THIS render's closure rather
  // than declared as deps — they are fresh references on every keystroke, so
  // depending on them would re-run this effect (and wipe the draft) on every
  // change instead of only when the sheet opens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only on `open`'s rising edge, see comment above
  useEffect(() => {
    if (open) form.reset(toDefaultValues(entity));
  }, [open]);

  const handleMutationSuccess = (result: TResult) => {
    toast.add({ title: successMessage(result, entity), type: "success" });
    form.reset(toDefaultValues(entity));
    onOpenChange(false);
    onSuccess?.(result, entity);
  };

  const onSubmit = form.handleSubmit((values) => {
    // Two branches, not one union-typed `mutation.mutate(payload)` call: a
    // create and an update mutation usually take differently-shaped
    // variables (an update's carries the entity's id), so unifying them
    // would force `payload` to satisfy both shapes at once.
    if (isEdit) {
      mutations.update?.mutate(
        (toPayload ? toPayload(values, entity) : values) as TUpdatePayload,
        { onSuccess: handleMutationSuccess },
      );
      return;
    }

    mutations.create?.mutate(
      (toPayload ? toPayload(values, entity) : values) as TCreatePayload,
      { onSuccess: handleMutationSuccess },
    );
  });

  return {
    form,
    sheetProps: {
      open,
      onOpenChange,
      formId,
      onSubmit,
      isDirty: form.formState.isDirty,
      isPending: mutation?.isPending ?? false,
      errors: form.formState.errors as FieldErrors<TValues>,
    },
  };
}
