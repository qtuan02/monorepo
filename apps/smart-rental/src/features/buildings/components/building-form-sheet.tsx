import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import { Textarea } from "@monorepo/ui/components/textarea";
import { toast } from "@monorepo/ui/components/toast";

import type {
  BuildingFormInput,
  BuildingFormValues,
} from "~/features/buildings/types/building-form";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { buildingFormSchema } from "~/features/buildings/types/building-form";
import { useCreateBuilding } from "~/hooks/api/building";

interface BuildingFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORM_ID = "building-form";

/** "Thêm toà nhà mới": a Zod-validated form in a `FormSheet` that writes into the Mock and toasts. */
export default function BuildingFormSheet({
  open,
  onOpenChange,
}: BuildingFormSheetProps) {
  const createBuilding = useCreateBuilding();
  const form = useForm<BuildingFormInput, unknown, BuildingFormValues>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      name: "",
      address: "",
      totalFloors: "1",
      utilityCycleDay: "1",
      note: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createBuilding.mutate(values, {
      onSuccess: (building) => {
        toast.add({
          title: `Đã thêm toà nhà ${building.name}`,
          type: "success",
        });
        form.reset();
        onOpenChange(false);
      },
    });
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset();
        onOpenChange(next);
      }}
      title="Thêm toà nhà mới"
      description="Tạo toà nhà hoặc khu trọ mới để quản lý."
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={createBuilding.isPending}
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
            name="utilityCycleDay"
            label="Ngày chốt điện nước"
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
