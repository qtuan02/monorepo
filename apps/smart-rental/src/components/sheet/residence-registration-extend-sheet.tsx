import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FieldGroup } from "@monorepo/ui/components/field";
import { toast } from "@monorepo/ui/components/toast";

import { DateField } from "~/components/form/date-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { useExtendResidenceRegistration } from "~/hooks/api/compliance";
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

const FORM_ID = "residence-registration-extend-form";

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
  const form = useForm<ResidenceRegistrationExtendFormValues>({
    resolver: zodResolver(residenceRegistrationExtendFormSchema),
    defaultValues: defaultValues(),
  });

  const onSubmit = form.handleSubmit((values) => {
    extend.mutate(
      { tenantId, newDueDate: formatDate(values.newDueDate) },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã gia hạn Đăng ký tạm trú cho ${tenantName}`,
            type: "success",
          });
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        if (next) form.reset(defaultValues());
        onOpenChange(next);
      }}
      title="Gia hạn Đăng ký tạm trú"
      description="Cập nhật hạn mới sau khi Người thuê đã gia hạn trên Cổng dịch vụ công."
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={extend.isPending}
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
