import { AlertTriangle } from "lucide-react";
import { useWatch } from "react-hook-form";

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

import type { BuildingSettingsFormInput } from "~/features/buildings/types/building-settings-form";
import type { Building } from "~/types/building";
import { CurrencyField } from "~/components/form/currency-field";
import { TextField } from "~/components/form/text-field";
import { FormSheet } from "~/components/sheet/form-sheet";
import { ELECTRICITY_PRICE_CAP_PER_KWH } from "~/constants/tariff";
import { buildingSettingsFormSchema } from "~/features/buildings/types/building-settings-form";
import { useUpdateBuildingSettings } from "~/hooks/api/building";
import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";
import { formatCurrency } from "~/utils/currency";
import { isElectricityPriceOverCap } from "~/utils/tariff";

interface BuildingSettingsFormSheetProps {
  building: Building;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const { form, sheetProps } = useEntityFormSheet({
    open,
    onOpenChange,
    schema: buildingSettingsFormSchema,
    entity: building,
    toDefaultValues: (entity) => toDefaultValues(entity ?? building),
    mutations: { update: updateSettings },
    toPayload: (values) => {
      const hasBankAccount = values.bankCode !== "";
      return {
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
      };
    },
    successMessage: () => `Đã cập nhật cài đặt ${building.name}`,
  });

  const electricityPrice = Number(
    useWatch({ control: form.control, name: "electricityPricePerKwh" }),
  );
  const isOverCap =
    Number.isFinite(electricityPrice) &&
    isElectricityPriceOverCap(electricityPrice);

  return (
    <FormSheet
      {...sheetProps}
      title="Cài đặt toà nhà"
      description={building.name}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Ngày thu</FieldLegend>
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
