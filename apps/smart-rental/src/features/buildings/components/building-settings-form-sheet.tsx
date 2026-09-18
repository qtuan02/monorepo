import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@monorepo/ui/components/field";
import { toast } from "@monorepo/ui/components/toast";

import type {
  BuildingSettingsFormInput,
  BuildingSettingsFormValues,
} from "~/features/buildings/types/building-settings-form";
import type { Building } from "~/types/building";
import { CurrencyField } from "~/components/form/currency-field";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";
import { buildingSettingsFormSchema } from "~/features/buildings/types/building-settings-form";
import { useUpdateBuildingSettings } from "~/hooks/api/building";
import { formatCurrency } from "~/utils/currency";
import { isElectricityPriceOverCap } from "~/utils/tariff";

interface BuildingSettingsFormSheetProps {
  building: Building;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORM_ID = "building-settings-form";

function toDefaultValues(building: Building): BuildingSettingsFormInput {
  return {
    collectionDay: String(building.collectionDay),
    electricityPricePerKwh: String(building.priceList.electricityPricePerKwh),
    waterPricePerM3: String(building.priceList.waterPricePerM3),
    serviceFee: String(building.priceList.serviceFee),
    bankCode: building.bankAccount?.bankCode ?? "",
    bankName: building.bankAccount?.bankName ?? "",
    accountNumber: building.bankAccount?.accountNumber ?? "",
    accountName: building.bankAccount?.accountName ?? "",
  };
}

/**
 * "Cài đặt Toà nhà" (spec #153 §10 rows 25/32/34): ngày thu, Bảng giá,
 * Tài khoản nhận tiền, all in one `FormSheet`. Setting điện above the legal
 * cap does not block the save — it shows an `Alert` and still writes.
 */
export default function BuildingSettingsFormSheet({
  building,
  open,
  onOpenChange,
}: BuildingSettingsFormSheetProps) {
  const updateSettings = useUpdateBuildingSettings();
  const form = useForm<
    BuildingSettingsFormInput,
    unknown,
    BuildingSettingsFormValues
  >({
    resolver: zodResolver(buildingSettingsFormSchema),
    defaultValues: toDefaultValues(building),
  });

  // `open` flips from the parent's "Cài đặt" button — a plain setState, never
  // through FormSheet's own onOpenChange — so resetting inside that callback's
  // `next === true` branch would never run. Reset here instead, or cancelling
  // a dirty edit (confirmed via the "Đóng biểu mẫu" dialog) leaves the sheet
  // showing the discarded values instead of the Toà nhà's real settings.
  useEffect(() => {
    if (open) form.reset(toDefaultValues(building));
  }, [open, building, form]);

  const electricityPrice = Number(
    useWatch({ control: form.control, name: "electricityPricePerKwh" }),
  );
  const isOverCap =
    Number.isFinite(electricityPrice) &&
    isElectricityPriceOverCap(electricityPrice);

  const onSubmit = form.handleSubmit((values) => {
    const hasBankAccount = values.bankCode !== "";
    updateSettings.mutate(
      {
        buildingId: building.id,
        collectionDay: values.collectionDay,
        priceList: {
          electricityPricePerKwh: values.electricityPricePerKwh,
          waterPricePerM3: values.waterPricePerM3,
          serviceFee: values.serviceFee,
        },
        bankAccount: hasBankAccount
          ? {
              bankCode: values.bankCode,
              bankName: values.bankName,
              accountNumber: values.accountNumber,
              accountName: values.accountName,
            }
          : undefined,
      },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã cập nhật cài đặt ${building.name}`,
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
      onOpenChange={onOpenChange}
      title="Cài đặt toà nhà"
      description={building.name}
      formId={FORM_ID}
      onSubmit={onSubmit}
      isDirty={form.formState.isDirty}
      isPending={updateSettings.isPending}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Chu kỳ thu</FieldLegend>
          <TextField
            control={form.control}
            name="collectionDay"
            label="Ngày thu trong tháng"
            required
            type="number"
            min={1}
            max={31}
          />
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend variant="label">Bảng giá</FieldLegend>
          <FieldGroup>
            <CurrencyField
              control={form.control}
              name="electricityPricePerKwh"
              label="Giá điện / kWh"
              required
            />
            {isOverCap && (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>Vượt trần giá điện cho người thuê</AlertTitle>
                <AlertDescription>
                  Trần theo quy định hiện hành là{" "}
                  {formatCurrency(ELECTRICITY_PRICE_CAP_PER_KWH)}/kWh. Vẫn có
                  thể lưu, nhưng hãy cân nhắc mức phạt.
                </AlertDescription>
              </Alert>
            )}
            <CurrencyField
              control={form.control}
              name="waterPricePerM3"
              label="Giá nước / m³"
              required
            />
            <CurrencyField
              control={form.control}
              name="serviceFee"
              label="Dịch vụ cố định / tháng"
              required
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend variant="label">Tài khoản nhận tiền</FieldLegend>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                control={form.control}
                name="bankCode"
                label="Mã ngân hàng (BIN)"
                placeholder="VD: VCB"
              />
              <TextField
                control={form.control}
                name="bankName"
                label="Tên ngân hàng"
                placeholder="VD: Vietcombank"
              />
            </div>
            <TextField
              control={form.control}
              name="accountNumber"
              label="Số tài khoản"
              placeholder="Nhập số tài khoản"
            />
            <TextField
              control={form.control}
              name="accountName"
              label="Tên chủ tài khoản"
              placeholder="Nhập tên chủ tài khoản"
            />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </FormSheet>
  );
}
