import { Controller } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Textarea } from "@monorepo/ui/components/textarea";

import type { UtilityType } from "~/types/utility";
import { FormSheet } from "~/components/sheet/form-sheet";
import { utilityTypeConfig } from "~/constants/status";
import { oldIndexCorrectionFormSchema } from "~/features/cycles/types/old-index-correction-form";
import { useCorrectCycleOldIndex } from "~/hooks/api/cycle";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";

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
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: oldIndexCorrectionFormSchema,
    toDefaultValues: () => ({ oldIndex: String(currentOldIndex), note: "" }),
    mutations: { create: correctOldIndex },
    toPayload: (values) => ({
      roomId,
      type,
      month,
      oldIndex: Number(values.oldIndex),
      note: values.note,
    }),
    successMessage: () =>
      `Đã sửa chỉ số ${typeLabel.toLowerCase()} cũ của ${roomName}`,
  });

  return (
    <FormSheet
      {...sheetProps}
      title={`Sửa chỉ số ${typeLabel.toLowerCase()} cũ`}
      description={`${roomName} — dùng khi thay công tơ giữa Kỳ.`}
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
