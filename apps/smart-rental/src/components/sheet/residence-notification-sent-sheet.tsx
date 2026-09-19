import * as z from "zod";

import dayjs from "@monorepo/dayjs";
import { FieldGroup } from "@monorepo/ui/components/field";

import { DateField } from "~/components/form/date-field";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { useMarkResidenceNotificationSent } from "~/hooks/api/compliance";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";
import { formatDate } from "~/utils/date";

const residenceNotificationSentFormSchema = z.object({
  referenceNumber: z
    .string({ error: "Nhập mã hồ sơ" })
    .trim()
    .min(1, { error: "Nhập mã hồ sơ" }),
  sentDate: z
    .string({ error: "Chọn ngày gửi" })
    .min(1, { error: "Chọn ngày gửi" }),
});

type ResidenceNotificationSentFormValues = z.infer<
  typeof residenceNotificationSentFormSchema
>;

function defaultValues(): ResidenceNotificationSentFormValues {
  return { referenceNumber: "", sentDate: dayjs().format("YYYY-MM-DD") };
}

interface ResidenceNotificationSentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
}

/**
 * "Đã gửi" (ticket #188): hỏi mã hồ sơ Cổng DVC + ngày gửi thật, thay vì
 * đánh dấu ngay với mã tự bịa (`CT01-<tenantId>`) như trước. Dùng chung bởi
 * `/compliance` và tab Lưu trú của Người thuê.
 */
export function ResidenceNotificationSentSheet({
  open,
  onOpenChange,
  tenantId,
  tenantName,
}: ResidenceNotificationSentSheetProps) {
  const markSent = useMarkResidenceNotificationSent();
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: residenceNotificationSentFormSchema,
    toDefaultValues: defaultValues,
    mutations: { create: markSent },
    toPayload: (values) => ({
      tenantId,
      referenceNumber: values.referenceNumber,
      sentDate: formatDate(values.sentDate),
    }),
    successMessage: () => `Đã đánh dấu gửi Thông báo lưu trú cho ${tenantName}`,
  });

  return (
    <FormSheet
      {...sheetProps}
      title="Đã gửi Thông báo lưu trú"
      description="Nhập mã hồ sơ và ngày gửi thật trên Cổng dịch vụ công."
    >
      <FieldGroup>
        <TextField
          control={form.control}
          name="referenceNumber"
          label="Mã hồ sơ"
          required
          placeholder="VD: CT01-0001"
        />
        <DateField
          control={form.control}
          name="sentDate"
          label="Ngày gửi"
          required
        />
      </FieldGroup>
    </FormSheet>
  );
}
