import * as z from "zod";

import { FieldGroup } from "@monorepo/ui/components/field";

import { DateField } from "~/components/form/date-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { useExtendResidenceRegistration } from "~/hooks/api/compliance";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";
import { formatDate } from "~/utils/date";

const residenceRegistrationExtendFormSchema = z.object({
  newDueDate: z
    .string({ error: "Chọn hạn mới" })
    .min(1, { error: "Chọn hạn mới" }),
});

type ResidenceRegistrationExtendFormValues = z.infer<
  typeof residenceRegistrationExtendFormSchema
>;

function defaultValues(): ResidenceRegistrationExtendFormValues {
  return { newDueDate: "" };
}

interface ResidenceRegistrationExtendSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
}

/**
 * "Đã gia hạn đến …" (ticket #188): the one write Đăng ký tạm trú has —
 * registrationStatus itself is never stored, only `dueDate` moves.
 */
export function ResidenceRegistrationExtendSheet({
  open,
  onOpenChange,
  tenantId,
  tenantName,
}: ResidenceRegistrationExtendSheetProps) {
  const extend = useExtendResidenceRegistration();
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: residenceRegistrationExtendFormSchema,
    toDefaultValues: defaultValues,
    mutations: { create: extend },
    toPayload: (values) => ({
      tenantId,
      newDueDate: formatDate(values.newDueDate),
    }),
    successMessage: () => `Đã gia hạn Đăng ký tạm trú cho ${tenantName}`,
  });

  return (
    <FormSheet
      {...sheetProps}
      title="Gia hạn Đăng ký tạm trú"
      description="Cập nhật hạn mới sau khi Người thuê đã gia hạn trên Cổng dịch vụ công."
    >
      <FieldGroup>
        <DateField
          control={form.control}
          name="newDueDate"
          label="Hạn mới"
          required
        />
      </FieldGroup>
    </FormSheet>
  );
}
