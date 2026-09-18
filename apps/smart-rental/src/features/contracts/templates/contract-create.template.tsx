import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import { toast } from "@monorepo/ui/components/toast";

import type {
  ContractFormInput,
  ContractFormValues,
} from "~/features/contracts/types/contract-form";
import type { Tenant } from "~/types/tenant";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { TextField } from "~/components/form/text-field";
import { SelectRoom } from "~/components/select/select-room";
import { SelectTenant } from "~/components/select/select-tenant";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { contractFormSchema } from "~/features/contracts/types/contract-form";
import TenantFormSheet from "~/features/tenants/components/tenant-form-sheet";
import { useCreateContract } from "~/hooks/api/contract";
import { useGetRoom } from "~/hooks/api/room";
import { useGetTenant } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

const FORM_ID = "contract-form";

/** The wizard's steps, each naming the fields it must validate before moving on. */
const wizardSteps: { title: string; fields: (keyof ContractFormInput)[] }[] = [
  { title: "Chọn phòng", fields: ["roomId"] },
  { title: "Người thuê", fields: ["tenantId"] },
  {
    title: "Điều khoản",
    fields: [
      "startDate",
      "endDate",
      "rentAmount",
      "depositAmount",
      "noticeDays",
    ],
  },
  { title: "Xác nhận", fields: [] },
];
const LAST_STEP = wizardSteps.length - 1;

type ContractForm = ReturnType<
  typeof useForm<ContractFormInput, unknown, ContractFormValues>
>;

/**
 * "Tạo hợp đồng mới": the four-step wizard (spec #153 §3.5) — a horizontal
 * stepper over one Zod schema, one column, "Xác nhận" as the last step so no
 * step ever leaves a column empty. Step 1 lists only "available" Phòng of
 * the Building scope already selected; step 2 picks an existing Người thuê
 * or opens `TenantFormSheet` without leaving the page.
 */
export default function ContractCreateTemplate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createContract = useCreateContract();
  const form = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      roomId: "",
      tenantId: "",
      startDate: "",
      endDate: "",
      rentAmount: "3000000",
      depositAmount: "3000000",
      noticeDays: "30",
    },
  });

  const roomId = useWatch({ control: form.control, name: "roomId" });
  const { data: room } = useGetRoom(roomId, { enabled: !!roomId });

  const steps = wizardSteps.map((wizardStep, index) => ({
    id: wizardStep.title,
    title: wizardStep.title,
    isCompleted: index < step,
    isActive: index === step,
  }));

  const nextStep = async () => {
    const fields = wizardSteps[step]?.fields ?? [];
    if (await form.trigger(fields)) setStep((s) => Math.min(s + 1, LAST_STEP));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = form.handleSubmit((values) => {
    createContract.mutate(values, {
      onSuccess: (contract) => {
        toast.add({
          title: `Đã tạo hợp đồng ${contract.contractNumber}`,
          type: "success",
        });
        navigate(ROUTES.contractDetailPath(contract.id));
      },
    });
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tạo hợp đồng mới
          </h1>
          <p className="text-muted-foreground">
            Quy trình 4 bước để thiết lập hợp đồng thuê phòng
          </p>
        </div>
        <Link
          to={ROUTES.CONTRACTS}
          className={buttonVariants({ variant: "outline" })}
        >
          Hủy
        </Link>
      </div>

      <LifecycleStepper steps={steps} orientation="horizontal" />

      <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
        {step === 0 && <RoomStep form={form} buildingId={selectedBuildingId} />}
        {step === 1 && (
          <TenantStep
            form={form}
            buildingId={room?.buildingId ?? selectedBuildingId}
          />
        )}
        {step === 2 && <TermsStep form={form} />}
        {step === LAST_STEP && <PreviewStep form={form} room={room} />}
      </form>

      <div className="bg-background sticky bottom-0 flex justify-between border-t py-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 0}
        >
          <ChevronLeft />
          Quay lại
        </Button>
        {step < LAST_STEP ? (
          <Button type="button" onClick={nextStep}>
            Tiếp theo
            <ChevronRight />
          </Button>
        ) : (
          <Button
            type="submit"
            form={FORM_ID}
            disabled={createContract.isPending}
          >
            <Save />
            {createContract.isPending ? "Đang lưu…" : "Lưu hợp đồng"}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Step 1: a Combobox of only "available" Phòng, scoped to the Building scope. */
function RoomStep({
  form,
  buildingId,
}: {
  form: ContractForm;
  buildingId: string | null;
}) {
  return (
    <Controller
      name="roomId"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Phòng trống</FieldLabel>
          <SelectRoom
            buildingId={buildingId}
            onlyAvailable
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? "")}
            placeholder="Tìm phòng trống…"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

/** Step 2: an existing Người thuê, or a new hồ sơ created inline. */
function TenantStep({
  form,
  buildingId,
}: {
  form: ContractForm;
  buildingId: string | null;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Controller
        name="tenantId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Người thuê</FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <SelectTenant
                  buildingId={buildingId}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "")}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(true)}
              >
                <Plus />
                Thêm mới
              </Button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <TenantFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCreated={(tenant: Tenant) => form.setValue("tenantId", tenant.id)}
      />
    </>
  );
}

/** Step 3: dates via `DateField`, tiền via `CurrencyField`, báo trước. */
function TermsStep({ form }: { form: ContractForm }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField
          control={form.control}
          name="startDate"
          label="Ngày bắt đầu"
          required
        />
        <DateField
          control={form.control}
          name="endDate"
          label="Ngày kết thúc"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField
          control={form.control}
          name="rentAmount"
          label="Tiền thuê"
          required
        />
        <CurrencyField
          control={form.control}
          name="depositAmount"
          label="Tiền cọc"
          required
        />
      </div>
      <TextField
        control={form.control}
        name="noticeDays"
        label="Báo trước (ngày)"
        type="number"
        min={1}
        required
      />
    </div>
  );
}

/** Step 4: the sentence the landlord confirms, off the live form values. */
function PreviewStep({
  form,
  room,
}: {
  form: ContractForm;
  room: { name: string } | null | undefined;
}) {
  const [tenantId, startDate, endDate, rentAmount, depositAmount, noticeDays] =
    useWatch({
      control: form.control,
      name: [
        "tenantId",
        "startDate",
        "endDate",
        "rentAmount",
        "depositAmount",
        "noticeDays",
      ],
    });
  const { data: tenant } = useGetTenant(tenantId, { enabled: !!tenantId });

  return (
    <div className="bg-muted/30 space-y-1.5 rounded-lg border p-4 text-sm">
      <p>
        Hợp đồng thuê <strong>{room?.name ?? "…"}</strong> bởi{" "}
        <strong>{tenant?.name ?? "…"}</strong>.
      </p>
      <p>
        Từ {startDate ? formatDate(startDate) : "…"} đến{" "}
        {endDate ? formatDate(endDate) : "…"}, giá{" "}
        {formatCurrency(Number(rentAmount) || 0)}/tháng, cọc{" "}
        {formatCurrency(Number(depositAmount) || 0)}.
      </p>
      <p>Báo trước {noticeDays || "—"} ngày.</p>
    </div>
  );
}
