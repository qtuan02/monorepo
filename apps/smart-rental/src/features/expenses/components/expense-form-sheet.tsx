import { Controller } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";

import type { ExpenseFormInput } from "~/features/expenses/types/expense-form";
import type { Expense } from "~/types/expense";
import { AttachmentUrlField } from "~/components/form/attachment-url-field";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { TextField } from "~/components/form/text-field";
import { SelectBuilding } from "~/components/select/select-building";
import { FormSheet } from "~/components/sheet/form-sheet";
import { expenseFormSchema } from "~/features/expenses/types/expense-form";
import { useCreateExpense, useUpdateExpense } from "~/hooks/api/expense";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";

interface ExpenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit this Chi phí; absent → create a new one. */
  expense?: Expense;
  /** The Building scope already picked — prefills the Combobox on create. */
  defaultBuildingId?: string | null;
}

function toDefaultValues(
  expense: Expense | undefined,
  defaultBuildingId: string | null | undefined,
): ExpenseFormInput {
  return {
    buildingId: expense?.buildingId ?? defaultBuildingId ?? "",
    category: expense?.category ?? "",
    amount: String(expense?.amount ?? 0),
    expenseDate: expense?.expenseDate ?? "",
    description: expense?.description ?? "",
    receiptImageUrl: expense?.receiptImageUrl ?? "",
  };
}

/**
 * "Tạo/sửa Chi phí" (spec #153 §10 row 15): one `FormSheet` for both flows,
 * switched by whether `expense` was handed in — the same shape
 * `RoomFormSheet` takes.
 */
export default function ExpenseFormSheet({
  open,
  onOpenChange,
  expense,
  defaultBuildingId,
}: ExpenseFormSheetProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const isEdit = !!expense;

  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: expenseFormSchema,
    entity: expense,
    toDefaultValues: (entity) => toDefaultValues(entity, defaultBuildingId),
    mutations: { create: createExpense, update: updateExpense },
    toPayload: (values, entity) => {
      const payload = {
        ...values,
        description: values.description || undefined,
        receiptImageUrl: values.receiptImageUrl || undefined,
      };
      return entity ? { expenseId: entity.id, ...payload } : payload;
    },
    successMessage: (_result, entity) =>
      entity ? "Đã cập nhật khoản chi" : "Đã thêm khoản chi",
  });

  return (
    <FormSheet
      {...sheetProps}
      title={isEdit ? "Chỉnh sửa khoản chi" : "Thêm khoản chi"}
      description={isEdit ? undefined : "Ghi nhận một khoản chi nội bộ."}
    >
      <FieldGroup>
        <Controller
          name="buildingId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Toà nhà
                <span aria-hidden className="text-destructive">
                  *
                </span>
              </FieldLabel>
              <SelectBuilding
                id={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <TextField
          control={form.control}
          name="category"
          label="Danh mục"
          required
          placeholder="VD: Bảo trì"
        />

        <CurrencyField
          control={form.control}
          name="amount"
          label="Số tiền"
          required
        />

        <DateField
          control={form.control}
          name="expenseDate"
          label="Ngày chi"
          required
        />

        <TextField
          control={form.control}
          name="description"
          label="Mô tả"
          placeholder="Tuỳ chọn"
        />

        <AttachmentUrlField
          control={form.control}
          name="receiptImageUrl"
          label="Biên lai"
        />
      </FieldGroup>
    </FormSheet>
  );
}
