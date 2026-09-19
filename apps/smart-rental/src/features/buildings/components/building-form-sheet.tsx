import { Controller } from "react-hook-form";

import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import { Textarea } from "@monorepo/ui/components/textarea";

import type { BuildingFormInput } from "~/features/buildings/types/building-form";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { buildingFormSchema } from "~/features/buildings/types/building-form";
import { useCreateBuilding } from "~/hooks/api/building";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";

interface BuildingFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDefaultValues(): BuildingFormInput {
  return {
    name: "",
    address: "",
    totalFloors: "1",
    collectionDay: "1",
    note: "",
  };
}

/** "Thêm toà nhà mới": a Zod-validated form in a `FormSheet` that writes into the Mock and toasts. */
export default function BuildingFormSheet({
  open,
  onOpenChange,
}: BuildingFormSheetProps) {
  const createBuilding = useCreateBuilding();
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: buildingFormSchema,
    toDefaultValues,
    mutations: { create: createBuilding },
    successMessage: (building) => `Đã thêm toà nhà ${building.name}`,
  });

  return (
    <FormSheet
      {...sheetProps}
      title="Thêm toà nhà mới"
      description="Tạo toà nhà hoặc khu trọ mới để quản lý."
    >
      <FieldGroup>
        <TextField
          control={form.control}
          name="name"
          label="Tên toà nhà"
          required
          placeholder="VD: Trọ Sinh Viên"
        />
        <TextField
          control={form.control}
          name="address"
          label="Địa chỉ"
          required
          placeholder="Nhập địa chỉ đầy đủ"
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="totalFloors"
            label="Số tầng"
            required
            type="number"
            min={1}
          />
          <TextField
            control={form.control}
            name="collectionDay"
            label="Ngày thu trong tháng"
            required
            type="number"
            min={1}
            max={31}
          />
        </div>
        <Controller
          name="note"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Ghi chú</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Thêm ghi chú nếu có"
              />
            </Field>
          )}
        />
      </FieldGroup>
    </FormSheet>
  );
}
