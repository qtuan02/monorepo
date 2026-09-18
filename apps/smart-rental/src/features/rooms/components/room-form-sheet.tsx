import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { toast } from "@monorepo/ui/components/toast";

import type {
  RoomFormInput,
  RoomFormValues,
} from "~/features/rooms/types/room-form";
import type { Room } from "~/types/room";
import { CurrencyField } from "~/components/form/currency-field";
import { TextField } from "~/components/form/text-field";
import { SelectBuilding } from "~/components/select/select-building";
import { FormSheet } from "~/components/sheet/form-sheet";
import { roomStatusConfig, roomTypeConfig } from "~/constants/status";
import { roomFormSchema } from "~/features/rooms/types/room-form";
import { useCreateRoom, useUpdateRoom } from "~/hooks/api/room";

interface RoomFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → edit this Phòng; absent → create a new one. */
  room?: Room;
  /** The Building scope already picked — prefills the Combobox on create. */
  defaultBuildingId?: string | null;
}

const FORM_ID = "room-form";

function toDefaultValues(
  room: Room | undefined,
  defaultBuildingId: string | null | undefined,
): RoomFormInput {
  return {
    buildingId: room?.buildingId ?? defaultBuildingId ?? "",
    name: room?.name ?? "",
    floor: String(room?.floor ?? 1),
    area: String(room?.area ?? 20),
    type: room?.type ?? "single",
    status: room?.status ?? "available",
    price: String(room?.price ?? 0),
  };
}

/**
 * "Tạo/sửa Phòng" (spec #153 §10 row 15): one `FormSheet` for both flows,
 * switched by whether `room` was handed in — the same shape
 * `BuildingSettingsFormSheet` takes for its one entity's edit form.
 */
export default function RoomFormSheet({
  open,
  onOpenChange,
  room,
  defaultBuildingId,
}: RoomFormSheetProps) {
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const isEdit = !!room;

  const form = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: toDefaultValues(room, defaultBuildingId),
  });

  // `open` flips from a plain parent setState ("Thêm phòng" / "Chỉnh sửa"),
  // never through FormSheet's own onOpenChange — so resetting inside that
  // callback's `next === true` branch would never run. Reset here instead, or
  // cancelling a dirty create/edit (confirmed via "Đóng biểu mẫu") leaves the
  // sheet showing the discarded input on the next open.
  useEffect(() => {
    if (open) form.reset(toDefaultValues(room, defaultBuildingId));
  }, [open, room, defaultBuildingId, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (room) {
      updateRoom.mutate(
        // `tenant` is untouched by this form — carried over as-is.
        { roomId: room.id, ...values, tenant: room.tenant },
        {
          onSuccess: (updated) => {
            toast.add({
              title: `Đã cập nhật ${updated.name}`,
              type: "success",
            });
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createRoom.mutate(
      { ...values, tenant: null },
      {
        onSuccess: (created) => {
          toast.add({
            title: `Đã thêm phòng ${created.name}`,
            type: "success",
          });
          form.reset(toDefaultValues(undefined, defaultBuildingId));
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Chỉnh sửa ${room.name}` : "Thêm phòng mới"}
      description={isEdit ? undefined : "Tạo phòng mới trong một toà nhà."}
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={isEdit ? updateRoom.isPending : createRoom.isPending}
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
          name="name"
          label="Tên phòng"
          required
          placeholder="VD: Phòng 101"
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="floor"
            label="Tầng"
            required
            type="number"
            min={1}
          />
          <TextField
            control={form.control}
            name="area"
            label="Diện tích (m²)"
            required
            type="number"
            min={1}
          />
        </div>

        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Loại phòng</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roomTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roomStatusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <CurrencyField
          control={form.control}
          name="price"
          label="Giá thuê / tháng"
          required
        />
      </FieldGroup>
    </FormSheet>
  );
}
