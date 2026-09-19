import { FieldGroup } from "@monorepo/ui/components/field";

import type { TenantFormInput } from "~/features/tenants/types/tenant-form";
import type { Tenant } from "~/types/tenant";
import { DateField } from "~/components/form/date-field";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { tenantFormSchema } from "~/features/tenants/types/tenant-form";
import { useCreateTenant, useUpdateTenant } from "~/hooks/api/tenant";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";
import { useBuildingStore } from "~/stores/use-building-store";

interface TenantFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → sửa; absent → thêm mới. Key the element on `tenant?.id` so a new tenant remounts the form. */
  tenant?: Tenant;
  /** Fires only on a successful create — the Hợp đồng wizard's own step 2 selects the new id straight away. */
  onCreated?: (tenant: Tenant) => void;
}

function toDefaultValues(tenant: Tenant | undefined): TenantFormInput {
  return {
    fullName: tenant?.name ?? "",
    idCard: tenant?.idNumber ?? "",
    dob: "",
    hometown: "",
    phone: tenant?.phone ?? "",
    email: tenant?.email ?? "",
    vehicleType: "",
    vehiclePlate: "",
  };
}

/**
 * "Tạo/sửa trong Sheet" (spec #153 §10 row 15, ticket #161) — one Sheet, one
 * schema, for both. `dob`/`hometown`/`vehicleType`/`vehiclePlate` are
 * captured but, like the create flow before it, have no Tenant field of
 * their own to persist into yet — editing shows them blank rather than a
 * stale guess.
 */
export default function TenantFormSheet({
  open,
  onOpenChange,
  tenant,
  onCreated,
}: TenantFormSheetProps) {
  const isEdit = !!tenant;
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: tenantFormSchema,
    entity: tenant,
    toDefaultValues,
    mutations: { create: createTenant, update: updateTenant },
    toPayload: (values, entity) =>
      entity
        ? { tenantId: entity.id, payload: values }
        : { ...values, buildingId: selectedBuildingId ?? undefined },
    successMessage: (result, entity) =>
      entity
        ? `Đã cập nhật Người thuê ${result.name}`
        : `Đã thêm Người thuê ${result.name}`,
    onSuccess: (result, entity) => {
      if (!entity) onCreated?.(result);
    },
  });

  return (
    <FormSheet
      {...sheetProps}
      title={isEdit ? "Chỉnh sửa Người thuê" : "Thêm Người thuê mới"}
      description={
        isEdit
          ? "Cập nhật thông tin Người thuê."
          : "Nhập thông tin để thêm Người thuê mới."
      }
    >
      <FieldGroup>
        <TextField
          control={form.control}
          name="fullName"
          label="Họ và tên"
          required
          placeholder="Nguyễn Văn A"
        />
        <TextField
          control={form.control}
          name="idCard"
          label="Số CCCD"
          required
          placeholder="012345678912"
        />
        <DateField
          control={form.control}
          name="dob"
          label="Ngày sinh"
          required
        />
        <TextField
          control={form.control}
          name="hometown"
          label="Quê quán"
          required
          placeholder="Quận 1, TP. Hồ Chí Minh"
        />
        <TextField
          control={form.control}
          name="phone"
          label="Số điện thoại"
          required
          placeholder="0905 xxx xxx"
        />
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
          placeholder="email@example.com"
        />
        <TextField
          control={form.control}
          name="vehicleType"
          label="Loại xe"
          placeholder="VD: Honda Vision"
        />
        <TextField
          control={form.control}
          name="vehiclePlate"
          label="Biển số xe"
          placeholder="43-X1 123.45"
        />
      </FieldGroup>
    </FormSheet>
  );
}
