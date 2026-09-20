import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useState } from "react";
import { useController } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

import { DateField } from "~/components/form/date-field";
import {
  computeContractEndDate,
  computeRenewedEndDate,
} from "~/features/contracts/utils/contract-term";
import { formatDate } from "~/utils/date";

type TermPreset = "6" | "12" | "custom";

interface TermPickerProps<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
> {
  control: Control<TValues, unknown, TTransformed>;
  name: FieldPath<TValues>;
  /** ISO ngày bắt đầu khi `mode="fresh"`, hoặc ngày kết thúc hiện tại (DD/MM/YYYY) khi `mode="extend"`. */
  anchorDate: string;
  /** "fresh" = tạo mới (trừ một ngày trước kỷ niệm); "extend" = Gia hạn (cộng thẳng từ ngày kết thúc cũ). */
  mode: "fresh" | "extend";
  defaultMonths: 6 | 12;
  label: string;
  dateFieldLabel: string;
  /** Extra text appended after "Kết thúc …" when a preset (not "Khác") is picked. */
  hint?: string;
}

/** ISO ngày kết thúc theo đúng hàm sẵn có trong `contract-term` cho `mode`. */
function computeEndDate(
  mode: "fresh" | "extend",
  anchorDate: string,
  months: number,
): string {
  return mode === "fresh"
    ? computeContractEndDate(anchorDate, months)
    : computeRenewedEndDate(anchorDate, months);
}

/**
 * Thời hạn 6/12/Khác tháng, dùng chung cho "Tạo hợp đồng" và "Gia hạn" (spec
 * #227 C2) — chọn preset ghi `endDate` ngay qua `contract-term`; "Khác" mở
 * `DateField` và giữ nguyên ngày đã chọn cho tới khi đổi lại preset.
 */
export default function TermPicker<
  TValues extends FieldValues,
  TTransformed extends FieldValues,
>({
  control,
  name,
  anchorDate,
  mode,
  defaultMonths,
  label,
  dateFieldLabel,
  hint,
}: TermPickerProps<TValues, TTransformed>) {
  const [preset, setPreset] = useState<TermPreset>(
    defaultMonths === 12 ? "12" : "6",
  );
  const { field } = useController({ control, name });

  const onPresetChange = (next: TermPreset) => {
    if (next !== "custom") {
      field.onChange(computeEndDate(mode, anchorDate, next === "6" ? 6 : 12));
    }
    setPreset(next);
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <ToggleGroup
        value={[preset]}
        onValueChange={(next) => {
          const selected = next[0];
          if (selected) onPresetChange(selected as TermPreset);
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="6">6 tháng</ToggleGroupItem>
        <ToggleGroupItem value="12">12 tháng</ToggleGroupItem>
        <ToggleGroupItem value="custom">Khác</ToggleGroupItem>
      </ToggleGroup>
      {preset === "custom" ? (
        <DateField
          control={control}
          name={name}
          label={dateFieldLabel}
          required
        />
      ) : (
        <FieldDescription>
          Kết thúc{" "}
          {typeof field.value === "string" && field.value
            ? formatDate(field.value)
            : "…"}
          {hint ? ` · ${hint}` : ""}
        </FieldDescription>
      )}
    </Field>
  );
}
