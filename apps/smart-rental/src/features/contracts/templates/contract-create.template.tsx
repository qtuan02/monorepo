import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { toast } from "@monorepo/ui/components/toast";

import type {
  ContractFormInput,
  ContractFormValues,
} from "~/features/contracts/types/contract-form";
import { TextField } from "~/components/form/text-field";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { contractFormSchema } from "~/features/contracts/types/contract-form";
import { useGetBuildings } from "~/hooks/api/building";
import { useCreateContract } from "~/hooks/api/contract";
import { useGetRoom, useGetRooms } from "~/hooks/api/room";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";

const FORM_ID = "contract-form";

/** The wizard's steps, each naming the fields it must validate before moving on. */
const wizardSteps: { title: string; fields: (keyof ContractFormInput)[] }[] = [
  { title: "Chọn phòng", fields: ["buildingId", "roomId"] },
  {
    title: "Người thuê",
    fields: ["tenantName", "tenantPhone", "tenantIdCard"],
  },
  {
    title: "Điều khoản",
    fields: ["startDate", "termMonths", "rentAmount", "depositAmount"],
  },
  { title: "Xác nhận", fields: [] },
];
const LAST_STEP = wizardSteps.length - 1;

/**
 * "Tạo hợp đồng mới": the prototype's four-step wizard over one Zod schema.
 * Each "Tiếp theo" validates its own step's fields (the prototype let a
 * visitor skip ahead); the Toà nhà and Phòng selects read the Mock rather
 * than the prototype's two hard-coded options. Submit prepends to the Mock.
 */
export default function ContractCreateTemplate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const createContract = useCreateContract();
  const form = useForm<ContractFormInput, unknown, ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      buildingId: selectedBuildingId ?? "",
      roomId: "",
      tenantName: "",
      tenantPhone: "",
      tenantIdCard: "",
      startDate: "",
      termMonths: "6",
      rentAmount: "3000000",
      depositAmount: "3000000",
    },
  });

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
        navigate(ROUTES.CONTRACTS);
      },
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tạo hợp đồng mới</h1>
        <p className="text-muted-foreground">
          Quy trình 4 bước để thiết lập hợp đồng thuê phòng
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardContent>
            <LifecycleStepper steps={steps} />
          </CardContent>
        </Card>

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-4">
          {step === 0 && <RoomStep form={form} />}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Người thuê</CardTitle>
                <CardDescription>
                  Nhập thông tin người đại diện thuê phòng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="tenantName"
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                  />
                  <TextField
                    control={form.control}
                    name="tenantPhone"
                    label="Số điện thoại"
                    placeholder="0905 xxx xxx"
                  />
                </div>
                <TextField
                  control={form.control}
                  name="tenantIdCard"
                  label="Số CCCD"
                  placeholder="Nhập số CCCD"
                />
              </CardContent>
            </Card>
          )}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Điều khoản hợp đồng</CardTitle>
                <CardDescription>
                  Thời hạn, tiền cọc và các phí dịch vụ
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <TextField
                  control={form.control}
                  name="startDate"
                  label="Ngày bắt đầu"
                  type="date"
                />
                <TextField
                  control={form.control}
                  name="termMonths"
                  label="Thời hạn (tháng)"
                  type="number"
                  min={1}
                />
                <TextField
                  control={form.control}
                  name="rentAmount"
                  label="Giá thuê"
                  type="number"
                  min={0}
                />
                <TextField
                  control={form.control}
                  name="depositAmount"
                  label="Tiền cọc"
                  type="number"
                  min={0}
                />
              </CardContent>
            </Card>
          )}
          {step === LAST_STEP && <PreviewStep form={form} />}

          <div className="flex justify-between">
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
              <Button type="submit" disabled={createContract.isPending}>
                <Save />
                Lưu hợp đồng
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

type ContractForm = ReturnType<
  typeof useForm<ContractFormInput, unknown, ContractFormValues>
>;

/** Step 1: a Toà nhà, then one of its Phòng trống — both read off the Mock. */
function RoomStep({ form }: { form: ContractForm }) {
  const { data: buildings = [] } = useGetBuildings();
  const buildingId = useWatch({ control: form.control, name: "buildingId" });
  const { data: rooms = [] } = useGetRooms(
    { buildingId },
    { enabled: !!buildingId },
  );
  const availableRooms = rooms.filter((room) => room.status === "available");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chọn phòng trống</CardTitle>
        <CardDescription>Chọn phòng muốn lập hợp đồng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          name="buildingId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Toà nhà</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  form.setValue("roomId", "");
                }}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Chọn toà nhà..." />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="roomId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Phòng</FieldLabel>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "")}
                disabled={!buildingId}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Chọn phòng..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} (Trống)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}

/** Step 4: the sentence the landlord confirms, off the live form values. */
function PreviewStep({ form }: { form: ContractForm }) {
  const [roomId, tenantName, termMonths, rentAmount] = useWatch({
    control: form.control,
    name: ["roomId", "tenantName", "termMonths", "rentAmount"],
  });
  const { data: room } = useGetRoom(roomId, { enabled: !!roomId });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xác nhận & Hoàn tất</CardTitle>
        <CardDescription>
          Kiểm tra lại toàn bộ thông tin trước khi lưu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg border p-4 text-sm">
          <p>
            Hợp đồng thuê <strong>{room?.name ?? "..."}</strong> bởi{" "}
            <strong>{tenantName || "..."}</strong>.
          </p>
          <p className="mt-1">
            Thời hạn {termMonths || "0"} tháng, giá{" "}
            {formatCurrency(Number(rentAmount) || 0)}/tháng.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
