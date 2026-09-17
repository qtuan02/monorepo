import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Zap } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Switch } from "@monorepo/ui/components/switch";
import { toast } from "@monorepo/ui/components/toast";

import type {
  ElectricityTierFormInput,
  ElectricityTierFormValues,
} from "~/features/settings/types/electricity-tier-form";
import type { ElectricityTierConfig as ElectricityTierConfigValue } from "~/types/setting";
import {
  electricityTierFormSchema,
  nextTierFrom,
  toElectricityTierFormInput,
} from "~/features/settings/types/electricity-tier-form";
import { useUpdateElectricityTierConfig } from "~/hooks/api/setting";

const FORM_ID = "electricity-tier-form";

interface ElectricityTierConfigProps {
  config: ElectricityTierConfigValue;
}

/**
 * "Cấu hình điện bậc thang": a VAT switch and one editable row per step,
 * saved back into the Mock. The prototype drew this form but never mounted
 * it and never submitted it; the ticket asks for both.
 */
export default function ElectricityTierConfig({
  config,
}: ElectricityTierConfigProps) {
  const updateConfig = useUpdateElectricityTierConfig();
  const form = useForm<
    ElectricityTierFormInput,
    unknown,
    ElectricityTierFormValues
  >({
    resolver: zodResolver(electricityTierFormSchema),
    defaultValues: toElectricityTierFormInput(config),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  const onSubmit = form.handleSubmit((values) => {
    updateConfig.mutate(values, {
      onSuccess: () => {
        toast.add({
          title: "Đã lưu cấu hình điện bậc thang",
          type: "success",
        });
        form.reset(toElectricityTierFormInput(values));
      },
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="text-primary size-4" />
          Cấu hình điện bậc thang
        </CardTitle>
        <CardDescription>
          Thiết lập đơn giá điện theo định mức tiêu thụ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
          <Controller
            name="useVat"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>
                    Áp dụng VAT (10%)
                  </FieldLabel>
                  <FieldDescription>
                    Tự động cộng thêm 10% vào tổng tiền điện
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id={field.name}
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <div className="space-y-3">
            <div className="text-muted-foreground grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-1 text-xs font-semibold uppercase">
              <span>Từ (kWh)</span>
              <span>Đến (kWh)</span>
              <span>Đơn giá (đ)</span>
              <span className="w-8" />
            </div>

            {fields.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-start gap-3"
              >
                <Controller
                  name={`tiers.${index}.from`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        aria-label={`Bậc ${index + 1} từ (kWh)`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`tiers.${index}.to`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        placeholder="∞"
                        aria-label={`Bậc ${index + 1} đến (kWh)`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`tiers.${index}.price`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        aria-label={`Bậc ${index + 1} đơn giá (đ)`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Xóa bậc ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() =>
                append({
                  from: nextTierFrom(form.getValues("tiers")),
                  to: "",
                  price: "0",
                })
              }
            >
              <Plus />
              Thêm bậc thang
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!form.formState.isDirty}
          onClick={() => form.reset()}
        >
          Hủy
        </Button>
        <Button type="submit" form={FORM_ID} disabled={updateConfig.isPending}>
          Lưu cấu hình
        </Button>
      </CardFooter>
    </Card>
  );
}
