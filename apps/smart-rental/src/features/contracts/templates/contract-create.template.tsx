import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { Card, CardContent, CardFooter } from "@monorepo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { toast } from "@monorepo/ui/components/toast";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

import type {
  ContractFormInput,
  ContractFormValues,
} from "~/features/contracts/types/contract-form";
import type { Building } from "~/types/building";
import type { Room } from "~/types/room";
import type { Tenant } from "~/types/tenant";
import { InfoRow } from "~/components/card/info-card";
import { CurrencyField } from "~/components/form/currency-field";
import { DateField } from "~/components/form/date-field";
import { TextField } from "~/components/form/text-field";
import { SelectRoom } from "~/components/select/select-room";
import { SelectTenant } from "~/components/select/select-tenant";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import TermPicker from "~/features/contracts/components/term-picker";
import { contractFormSchema } from "~/features/contracts/types/contract-form";
import { computeContractEndDate } from "~/features/contracts/utils/contract-term";
import TenantFormSheet from "~/features/tenants/components/tenant-form-sheet";
import { useGetBuilding } from "~/hooks/api/building";
import { useCreateContract } from "~/hooks/api/contract";
import { useGetRoom } from "~/hooks/api/room";
import { useGetTenant } from "~/hooks/api/tenant";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

const FORM_ID = "contract-form";

const wizardSteps: { title: string; fields: (keyof ContractFormInput)[] }[] = [
  { title: "Phòng & Người thuê", fields: ["roomId", "tenantId"] },
  { title: "Điều khoản & xác nhận", fields: [] },
];
const LAST_STEP = wizardSteps.length - 1;

type ContractForm = ReturnType<
  typeof useForm<ContractFormInput, unknown, ContractFormValues>
>;
type DepositMode = "1" | "2" | "custom";

/** 1/2 tháng tiền thuê, hoặc `null` for "Khác" (the caller keeps whatever was typed). */
function depositMultiplier(mode: DepositMode): number | null {
  if (mode === "custom") return null;
  return mode === "1" ? 1 : 2;
}

/**
 * "Tạo hợp đồng mới": the two-step wizard (spec #179 §3.4), in one 640px card
 * like every other form (round 4 Q17) — "Phòng & Người thuê" side by side,
 * then "Điều khoản & xác nhận" where tiền thuê/cọc/thời hạn are pre-filled
 * from the Phòng and a live summary sits below the fields, "Ký hợp đồng" in
 * the card's own footer. `?room=` prefills step 1 from a Phòng trống's own
 * "Tạo hợp đồng" link (see `room-detail.template.tsx`).
 */
export default function ContractCreateTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillRoomId = searchParams.get("room");
  const [step, setStep] = useState(0);
  const [depositMode, setDepositMode] = useState<DepositMode>("1");
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createContract = useCreateContract();

  const initialStartDate = dayjs().format("YYYY-MM-DD");
  const form = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      roomId: "",
      tenantId: "",
      startDate: initialStartDate,
      // Computed once, synchronously, from the same default term (12 tháng)
      // the "Thời hạn" toggle itself defaults to — no effect needed for it.
      endDate: computeContractEndDate(initialStartDate, 12),
      rentAmount: "",
      depositAmount: "",
      noticeDays: "30",
    },
  });

  const [roomId] = useWatch({ control: form.control, name: ["roomId"] });
  const { data: room } = useGetRoom(roomId, { enabled: !!roomId });
  const { data: building } = useGetBuilding(room?.buildingId ?? "", {
    enabled: !!room?.buildingId,
  });

  // `?room=` prefill (spec #179): an unknown or no-longer-trống Phòng leaves
  // step 1 empty rather than silently pre-selecting the wrong thing. This
  // syncs to an external resource settling (the query), not to another form
  // field, so it stays an effect (react-effects-sync-only.md).
  const prefillRoomQuery = useGetRoom(prefillRoomId ?? "", {
    enabled: !!prefillRoomId,
  });
  useEffect(() => {
    if (!prefillRoomId || !prefillRoomQuery.isSuccess) return;
    const prefillRoom = prefillRoomQuery.data;
    if (prefillRoom && prefillRoom.status === "available") {
      form.setValue("roomId", prefillRoom.id);
    } else {
      toast.add({
        title: `Phòng ${prefillRoomId} không tồn tại hoặc không còn trống`,
        type: "error",
      });
    }
  }, [prefillRoomId, prefillRoomQuery.isSuccess, prefillRoomQuery.data, form]);

  // Tiền thuê điền sẵn từ giá Phòng khi chọn phòng (spec #179 §3.4) — the
  // same "seed a field once an external resource settles" shape as the
  // prefill effect above.
  useEffect(() => {
    if (room) form.setValue("rentAmount", String(room.price));
  }, [room, form]);

  // Cọc/ngày kết thúc are DERIVED from other form fields (tiền thuê, ngày
  // bắt đầu), not from an external resource — computed once, imperatively,
  // at the moment they matter (the toggle click, or the "Tiếp theo" that
  // first reveals them) rather than kept continuously in sync by a watching
  // effect (react-effects-sync-only.md: "deriving state in an effect").
  const recomputeDeposit = (mode: DepositMode) => {
    const multiplier = depositMultiplier(mode);
    if (multiplier === null) return; // "Khác" — the landlord types it directly.
    const rent = Number(form.getValues("rentAmount")) || 0;
    form.setValue("depositAmount", String(rent * multiplier));
  };
  const onDepositModeChange = (mode: DepositMode) => {
    recomputeDeposit(mode);
    setDepositMode(mode);
  };

  const steps = wizardSteps.map((wizardStep, index) => ({
    id: wizardStep.title,
    title: wizardStep.title,
    isCompleted: index < step,
    isActive: index === step,
  }));

  const nextStep = async () => {
    const fields = wizardSteps[step]?.fields ?? [];
    if (!(await form.trigger(fields))) return;
    if (step === 0) {
      // Tiền thuê only just arrived (step 1 doesn't need it) — seed cọc
      // from it now that step 2 is about to show it.
      recomputeDeposit(depositMode);
    }
    setStep((s) => Math.min(s + 1, LAST_STEP));
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
    <div className="mx-auto w-full max-w-[640px] space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold">
            {room ? `Tạo hợp đồng · ${room.name}` : "Tạo hợp đồng mới"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {room
              ? [
                  building?.name,
                  `Tầng ${room.floor}`,
                  `${formatCurrency(room.price)}/tháng`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "2 bước: chọn Phòng & Người thuê, rồi điều khoản"}
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

      <Card>
        <CardContent className="pt-6">
          <form id={FORM_ID} onSubmit={onSubmit} noValidate>
            {step === 0 ? (
              <RoomTenantStep
                form={form}
                buildingId={room?.buildingId ?? selectedBuildingId}
              />
            ) : (
              <TermsStep
                form={form}
                room={room}
                building={building}
                depositMode={depositMode}
                onDepositModeChange={onDepositModeChange}
              />
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {step === 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ChevronLeft />
              Quay lại
            </Button>
          )}
          {step === 0 ? (
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
              {createContract.isPending ? "Đang lưu…" : "Ký hợp đồng"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

/** Step 1: Phòng trống và Người thuê, hai combobox cạnh nhau (spec #179). */
function RoomTenantStep({
  form,
  buildingId,
}: {
  form: ContractForm;
  buildingId: string | null;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}

interface TermsStepProps {
  form: ContractForm;
  room: Room | null | undefined;
  building: Building | null | undefined;
  depositMode: DepositMode;
  onDepositModeChange: (mode: DepositMode) => void;
}

/**
 * Step 2: điều khoản, rồi tóm tắt sống ngay bên dưới — cả hai trong cùng một
 * card 640px với step 1 (round 4 Q17), "Ký hợp đồng" ở footer của card đó.
 */
function TermsStep({
  form,
  room,
  building,
  depositMode,
  onDepositModeChange,
}: TermsStepProps) {
  const [tenantId, rentAmount, depositAmount, startDate, endDate, noticeDays] =
    useWatch({
      control: form.control,
      name: [
        "tenantId",
        "rentAmount",
        "depositAmount",
        "startDate",
        "endDate",
        "noticeDays",
      ],
    });
  const { data: tenant } = useGetTenant(tenantId, { enabled: !!tenantId });
  const noticeStartDate =
    endDate && noticeDays
      ? dayjs(endDate)
          .subtract(Number(noticeDays) || 0, "day")
          .format(DATE_FORMAT)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField
          control={form.control}
          name="rentAmount"
          label="Tiền thuê / tháng"
          required
          description={room ? `Từ ${room.name}` : undefined}
        />
        <Field>
          <FieldLabel>Tiền cọc</FieldLabel>
          <ToggleGroup
            value={[depositMode]}
            onValueChange={(next) => {
              const selected = next[0];
              if (selected) onDepositModeChange(selected as DepositMode);
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="1">1 tháng</ToggleGroupItem>
            <ToggleGroupItem value="2">2 tháng</ToggleGroupItem>
            <ToggleGroupItem value="custom">Khác</ToggleGroupItem>
          </ToggleGroup>
          {depositMode === "custom" ? (
            <CurrencyField
              control={form.control}
              name="depositAmount"
              label="Số tiền cọc"
              required
            />
          ) : (
            <FieldDescription>
              {formatCurrency(Number(depositAmount) || 0)}
            </FieldDescription>
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField
          control={form.control}
          name="startDate"
          label="Ngày bắt đầu"
          required
        />
        <TermPicker
          control={form.control}
          name="endDate"
          anchorDate={startDate}
          mode="fresh"
          defaultMonths={12}
          label="Thời hạn"
          dateFieldLabel="Ngày kết thúc"
          hint={
            noticeStartDate ? `nhắc gia hạn từ ${noticeStartDate}` : undefined
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Ngày thu hằng tháng</FieldLabel>
          <p className="text-sm">
            {building ? `Ngày ${building.collectionDay}` : "—"}
          </p>
          <FieldDescription>Từ Toà nhà</FieldDescription>
        </Field>
        <TextField
          control={form.control}
          name="noticeDays"
          label="Báo trước khi rời (ngày)"
          type="number"
          min={1}
          required
        />
      </div>

      <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
        <p className="text-[15px] font-semibold">Xác nhận</p>
        <InfoRow
          label="Phòng"
          value={
            room ? `${room.name}${building ? ` · ${building.name}` : ""}` : "—"
          }
        />
        <InfoRow label="Người thuê" value={tenant?.name ?? "—"} />
        <InfoRow
          label="Thời hạn"
          value={
            startDate && endDate
              ? `${formatDate(startDate)} → ${formatDate(endDate)}`
              : "—"
          }
        />
        <InfoRow
          label="Tiền thuê"
          value={`${formatCurrency(Number(rentAmount) || 0)} / tháng`}
          isHighlighted
        />
        <InfoRow
          label="Cọc"
          value={`${formatCurrency(Number(depositAmount) || 0)} · giữ đến thanh lý`}
        />
        <InfoRow
          label="Ngày thu"
          value={building ? `Ngày ${building.collectionDay}` : "—"}
        />
      </div>
    </div>
  );
}
