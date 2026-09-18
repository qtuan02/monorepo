import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Textarea } from "@monorepo/ui/components/textarea";
import { toast } from "@monorepo/ui/components/toast";

import type { OldIndexCorrectionFormValues } from "~/features/cycles/types/old-index-correction-form";
import type { UtilityType } from "~/types/utility";
import { FormSheet } from "~/components/sheet/form-sheet";
import { utilityTypeConfig } from "~/constants/status";
import { oldIndexCorrectionFormSchema } from "~/features/cycles/types/old-index-correction-form";
import { useCorrectCycleOldIndex } from "~/hooks/api/cycle";

const FORM_ID = "old-index-correction-form";

interface OldIndexCorrectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomName: string;
  type: UtilityType;
  /** `YYYY-MM`. */
  month: string;
  currentOldIndex: number;
}

/**
 * "Sửa chỉ số cũ" (ticket #183, ADR-0013) — thay công tơ mid-kỳ: đổi chỉ số
 * đầu của một Phòng + đồng hồ cho đúng Kỳ này, ghi chú bắt buộc.
 */
export function OldIndexCorrectionSheet({
  open,
  onOpenChange,
  roomId,
  roomName,
  type,
  month,
  currentOldIndex,
}: OldIndexCorrectionSheetProps) {
  const correctOldIndex = useCorrectCycleOldIndex();
  const typeLabel = utilityTypeConfig[type].label;
  const defaultValues = (): OldIndexCorrectionFormValues => ({
    oldIndex: String(currentOldIndex),
    note: "",
  });
  const form = useForm<OldIndexCorrectionFormValues>({
    resolver: zodResolver(oldIndexCorrectionFormSchema),
    defaultValues: defaultValues(),
  });

  const onSubmit = form.handleSubmit((values) => {
    correctOldIndex.mutate(
      {
        roomId,
        type,
        month,
        oldIndex: Number(values.oldIndex),
        note: values.note,
      },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã sửa chỉ số ${typeLabel.toLowerCase()} cũ của ${roomName}`,
            type: "success",
          });
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset(defaultValues());
        onOpenChange(next);
      }}
      title={`Sửa chỉ số ${typeLabel.toLowerCase()} cũ`}
      description={`${roomName} — dùng khi thay công tơ giữa Kỳ.`}
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={correctOldIndex.isPending}
    >
      <FieldGroup>
        <Controller
          name="oldIndex"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Chỉ số {typeLabel.toLowerCase()} cũ mới
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                min={0}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="note"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ghi chú</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={3}
                placeholder="VD: thay công tơ điện ngày 18/09"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FormSheet>
  );
}
