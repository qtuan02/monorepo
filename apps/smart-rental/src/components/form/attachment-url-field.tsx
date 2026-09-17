import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { ReceiptAttachment } from "~/components/attachment/receipt-attachment";
import { TextField } from "~/components/form/text-field";

interface AttachmentUrlFieldProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> {
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  /** The bare noun — "Biên lai", "Hoá đơn" — never pre-prefixed with "Ảnh". */
  label: string;
}

/**
 * "Attachment biên lai" (spec #153 §3.5): a URL text field — this Mock has no
 * file-upload backend — plus a live preview through `ReceiptAttachment` once
 * a value is typed, so the form shows the same fallback-aware tile the detail
 * screen does. `label` is the bare noun; the field prompt reads "Ảnh <label>",
 * matching the detail screen's own "Ảnh biên lai" / "Ảnh hoá đơn" card title.
 */
export function AttachmentUrlField<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({ control, name, label }: AttachmentUrlFieldProps<TValues, TTransformed>) {
  const value = useWatch({ control, name }) as string | undefined;

  return (
    <div className="space-y-3">
      <TextField
        control={control}
        name={name}
        label={`Ảnh ${label.toLowerCase()}`}
        placeholder="https://..."
        description="Dán URL ảnh — chưa hỗ trợ tải tệp lên."
      />
      {value && <ReceiptAttachment src={value} label={label} />}
    </div>
  );
}
