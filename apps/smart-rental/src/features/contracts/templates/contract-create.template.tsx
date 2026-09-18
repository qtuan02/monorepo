import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
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
type TermMode = "6" | "12" | "custom";

/**
 * "Tạo hợp đồng mới": the two-step wizard (spec #179 §3.4) — "Phòng & Người
 * thuê" side by side, then "Điều khoản & xác nhận" where tiền thuê/cọc/thời
 * hạn are pre-filled from the Phòng and a live summary sits in the right
 * column with "Ký hợp đồng". `?room=` prefills step 1 from a Phòng trống's
 * own "Tạo hợp đồng" button.
 */
export default function ContractCreateTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillRoomId = searchParams.get("room");
  const [step, setStep] = useState(0);
  const [depositMode, setDepositMode] = useState<DepositMode>("1");
  const [termMode, setTermMode] = useState<TermMode>("12");
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createContract = useCreateContract();

  const form = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      roomId: "",
      tenantId: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      rentAmount: "",
      depositAmount: "",
      noticeDays: "30",
    },
  });

  const [roomId, rentAmount, startDate] = useWatch({
    control: form.control,
    name: ["roomId", "rentAmount", "startDate"],
  });
  const { data: room } = useGetRoom(roomId, { enabled: !!roomId });
  const { data: building } = useGetBuilding(room?.buildingId ?? "", {
    enabled: !!room?.buildingId,
  });

  // `?room=` prefill (spec #179): an unknown or no-longer-trống Phòng leaves
  // step 1 empty rather than silently pre-selecting the wrong thing.
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

  // Tiền thuê điền sẵn từ giá Phòng khi chọn phòng (spec #179 §3.4).
  useEffect(() => {
    if (room) form.setValue("rentAmount", String(room.price));
  }, [room, form]);

  // Cọc = tiền thuê × 1/2 tháng, trừ khi chọn "Khác".
  useEffect(() => {
    if (depositMode === "custom") return;
    const multiplier = depositMode === "1" ? 1 : 2;
    form.setValue(
      "depositAmount",
      String((Number(rentAmount) || 0) * multiplier),
    );
  }, [depositMode, rentAmount, form]);

  // Ngày kết thúc = ngày bắt đầu + thời hạn, trừ khi chọn "Khác".
  useEffect(() => {
    if (termMode === "custom" || !startDate) return;
    const months = termMode === "6" ? 6 : 12;
    form.setValue("endDate", computeContractEndDate(startDate, months));
  }, [termMode, startDate, form]);

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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {room ? `Tạo hợp đồng · ${room.name}` : "Tạo hợp đồng mới"}
          </h1>
          <p className="text-muted-foreground">
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
            onDepositModeChange={setDepositMode}
            termMode={termMode}
            onTermModeChange={setTermMode}
            onBack={prevStep}
            isPending={createContract.isPending}
          />
        )}
      </form>

      {step === 0 && (
        <div className="flex justify-end">
          <Button type="button" onClick={nextStep}>
            Tiếp theo
            <ChevronRight />
          </Button>
        </div>
      )}
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
  termMode: TermMode;
  onTermModeChange: (mode: TermMode) => void;
  onBack: () => void;
  isPending: boolean;
}

/**
 * Step 2: điều khoản điền sẵn ở bên trái, tóm tắt sống ở cột phải — "Ký hợp
 * đồng" nằm ngay trong card tóm tắt (spec #179 §3.4).
 */
function TermsStep({
  form,
  room,
  building,
  depositMode,
  onDepositModeChange,
  termMode,
  onTermModeChange,
  onBack,
  isPending,
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
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-4 pt-6">
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
            <Field>
              <FieldLabel>Thời hạn</FieldLabel>
              <ToggleGroup
                value={[termMode]}
                onValueChange={(next) => {
                  const selected = next[0];
                  if (selected) onTermModeChange(selected as TermMode);
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="6">6 tháng</ToggleGroupItem>
                <ToggleGroupItem value="12">12 tháng</ToggleGroupItem>
                <ToggleGroupItem value="custom">Khác</ToggleGroupItem>
              </ToggleGroup>
              {termMode === "custom" ? (
                <DateField
                  control={form.control}
                  name="endDate"
                  label="Ngày kết thúc"
                  required
                />
              ) : (
                <FieldDescription>
                  Kết thúc {endDate ? formatDate(endDate) : "…"}
                  {noticeStartDate
                    ? ` · nhắc gia hạn từ ${noticeStartDate}`
                    : ""}
                </FieldDescription>
              )}
            </Field>
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
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Xác nhận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="Phòng"
            value={
              room
                ? `${room.name}${building ? ` · ${building.name}` : ""}`
                : "—"
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
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft />
            Quay lại
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            className="flex-1"
            disabled={isPending}
          >
            <Save />
            {isPending ? "Đang lưu…" : "Ký hợp đồng"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
