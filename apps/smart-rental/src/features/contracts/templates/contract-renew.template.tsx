import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, FileX } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import { Textarea } from "@monorepo/ui/components/textarea";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import type {
  RenewContractFormInput,
  RenewContractFormValues,
} from "~/features/contracts/types/renew-contract-form";
import type { Contract } from "~/types/contract";
import { InfoRow } from "~/components/card/info-card";
import { TextField } from "~/components/form/text-field";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { renewContractFormSchema } from "~/features/contracts/types/renew-contract-form";
import { useGetContract, useRenewContract } from "~/hooks/api/contract";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

interface ContractRenewTemplateProps {
  contractId: string;
}

const TITLE = "Gia hạn hợp đồng";

/** "Gia hạn hợp đồng": the form, then a confirm card; confirming rewrites the Mock. */
export default function ContractRenewTemplate({
  contractId,
}: ContractRenewTemplateProps) {
  const { data: contract, isLoading } = useGetContract(contractId);
  const backTo = ROUTES.contractDetailPath(contractId);

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={backTo}>
        <CardGridSkeleton itemCount={2} />
      </DetailPageShell>
    );
  }

  if (!contract) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.CONTRACTS}>
        <EmptyPanel
          icon={FileX}
          title="Hợp đồng không tìm thấy"
          description={`Không có hợp đồng nào với mã ${contractId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  return (
    <DetailPageShell title={TITLE} backTo={backTo}>
      <RenewForm key={contract.id} contract={contract} />
    </DetailPageShell>
  );
}

const FORM_ID = "renew-contract-form";

/** Mounted only once the Hợp đồng is known, so its rent can seed the form. */
function RenewForm({ contract }: { contract: Contract }) {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const renewContract = useRenewContract();
  const form = useForm<
    RenewContractFormInput,
    unknown,
    RenewContractFormValues
  >({
    resolver: zodResolver(renewContractFormSchema),
    defaultValues: {
      newEndDate: "",
      newRentAmount: String(contract.rentAmount),
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(() => setIsConfirming(true));

  const confirm = form.handleSubmit((values) => {
    renewContract.mutate(
      { contractId: contract.id, ...values },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã gia hạn hợp đồng ${contract.contractNumber}`,
            type: "success",
          });
          navigate(ROUTES.contractDetailPath(contract.id));
        },
      },
    );
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hợp đồng hiện tại</CardTitle>
            <CardDescription>Thông tin chi tiết của hợp đồng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Số hợp đồng" value={contract.contractNumber} />
            <InfoRow label="Người thuê" value={contract.tenant} />
            <InfoRow label="Phòng" value={contract.room} />
            <InfoRow
              label="Tiền thuê"
              value={formatCurrency(contract.rentAmount)}
            />
            <InfoRow label="Ngày bắt đầu" value={contract.startDate} />
            <InfoRow label="Ngày kết thúc" value={contract.endDate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin gia hạn</CardTitle>
            <CardDescription>
              Nhập thông tin gia hạn hợp đồng mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id={FORM_ID}
              onSubmit={onSubmit}
              noValidate
              className="space-y-6"
            >
              <TextField
                control={form.control}
                name="newEndDate"
                label="Ngày kết thúc mới *"
                type="date"
                description={`Hợp đồng hiện tại sẽ kết thúc vào ${contract.endDate}`}
              />
              <TextField
                control={form.control}
                name="newRentAmount"
                label="Tiền thuê mới (VND) *"
                type="number"
                min={0}
                description={`Tiền thuê hiện tại: ${formatCurrency(contract.rentAmount)}`}
              />
              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Ghi chú</FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      rows={4}
                      placeholder="Nhập các ghi chú hoặc điều khoản bổ sung..."
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {!isConfirming && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate(ROUTES.contractDetailPath(contract.id))
                    }
                  >
                    Hủy
                  </Button>
                  <Button type="submit">Tiếp tục</Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {isConfirming && (
        <RenewConfirmCard
          form={form}
          currentRent={contract.rentAmount}
          isPending={renewContract.isPending}
          onConfirm={confirm}
          onEdit={() => setIsConfirming(false)}
        />
      )}
    </div>
  );
}

interface RenewConfirmCardProps {
  form: ReturnType<
    typeof useForm<RenewContractFormInput, unknown, RenewContractFormValues>
  >;
  currentRent: number;
  isPending: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}

/** The green confirm card, reading the form live so an edit shows through. */
function RenewConfirmCard({
  form,
  currentRent,
  isPending,
  onConfirm,
  onEdit,
}: RenewConfirmCardProps) {
  const [newEndDate, newRentAmount] = useWatch({
    control: form.control,
    name: ["newEndDate", "newRentAmount"],
  });
  const newRent = Number(newRentAmount) || 0;
  const delta = newRent - currentRent;

  return (
    <Card className="h-fit border-success/20 bg-success/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-success">
          <CheckCircle2 className="size-5" />
          Xác nhận gia hạn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-success/20">
          <AlertCircle className="text-success" />
          <AlertDescription>
            Vui lòng kiểm tra thông tin trước khi xác nhận
          </AlertDescription>
        </Alert>

        <div className="bg-card space-y-3 rounded-lg p-3">
          <InfoRow
            label="Ngày kết thúc mới"
            value={newEndDate ? formatDate(newEndDate) : "—"}
          />
          <InfoRow label="Tiền thuê mới" value={formatCurrency(newRent)} />
          <p className="text-muted-foreground border-t pt-3 text-xs">
            Thay đổi tiền thuê:{" "}
            <span
              className={cn(delta > 0 ? "text-destructive" : "text-success")}
            >
              {delta > 0 ? "+" : ""}
              {formatCurrency(delta)}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Đang lưu..." : "Xác nhận gia hạn"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending}
            onClick={onEdit}
          >
            Chỉnh sửa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
