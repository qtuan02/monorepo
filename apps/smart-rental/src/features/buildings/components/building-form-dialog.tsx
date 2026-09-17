import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@monorepo/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Textarea } from "@monorepo/ui/components/textarea";
import { toast } from "@monorepo/ui/components/toast";

import type {
  BuildingFormInput,
  BuildingFormValues,
} from "~/features/buildings/types/building-form";
import { buildingFormSchema } from "~/features/buildings/types/building-form";
import { useCreateBuilding } from "~/hooks/api/building";

interface BuildingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORM_ID = "building-form";

/** "Thêm toà nhà mới": a Zod-validated form that writes into the Mock and toasts. */
export default function BuildingFormDialog({
  open,
  onOpenChange,
}: BuildingFormDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm toà nhà mới</DialogTitle>
          <DialogDescription>
            Tạo toà nhà hoặc khu trọ mới để quản lý.
          </DialogDescription>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tên toà nhà</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="VD: Trọ Sinh Viên"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Địa chỉ</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nhập địa chỉ đầy đủ"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="totalFloors"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Số tầng</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={1}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="utilityCycleDay"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Ngày chốt điện nước
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={1}
                      max={31}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Ghi chú (Tùy chọn)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Thêm ghi chú nếu có"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={createBuilding.isPending}
          >
            Lưu lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
