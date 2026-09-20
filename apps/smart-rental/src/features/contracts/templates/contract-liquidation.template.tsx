import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, FileX } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@monorepo/ui/components/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@monorepo/ui/components/radio-group";
import { Textarea } from "@monorepo/ui/components/textarea";
import { toast } from "@monorepo/ui/components/toast";

import type {
  LiquidationFormInput,
  LiquidationFormValues,
} from "~/features/contracts/types/liquidation-form";
import type { Contract } from "~/types/contract";
import { InfoRow } from "~/components/card/info-card";
import { CurrencyField } from "~/components/form/currency-field";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import {
  liquidationDecisionOptions,
  liquidationFormSchema,
} from "~/features/contracts/types/liquidation-form";
import { useGetContract, useLiquidateContract } from "~/hooks/api/contract";
import { useGetInvoices } from "~/hooks/api/invoice";
import {
  computeContractDebt,
  computeDepositSettlement,
} from "~/utils/contract-liquidation";
import { contractActions } from "~/utils/contract-status";
import { formatCurrency } from "~/utils/currency";

interface ContractLiquidationTemplateProps {
  contractId: string;
}

const TITLE = "Thanh lý hợp đồng";

/** "Thanh lý hợp đồng": quyết toán Cọc thật, trừ nợ thật từ Hoá đơn chưa thu đủ. */
export default function ContractLiquidationTemplate({
  contractId,
}: ContractLiquidationTemplateProps) {
  const { data: contract, isLoading } = useGetContract(contractId);
  const invoicesQuery = useGetInvoices({ contractId }, { enabled: !!contract });

  if (isLoading || invoicesQuery.isLoading) {
    return (
      <DetailPageShell
        title={TITLE}
        breadcrumb={[
          { label: "Hợp đồng", to: ROUTES.CONTRACTS },
          { label: "Thanh lý" },
        ]}
      >
        <DetailSkeleton />
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

  const actions = contractActions(contract);
  const outstandingDebt = computeContractDebt(invoicesQuery.data ?? []);

  return (
    <DetailPageShell
      title={TITLE}
      breadcrumb={[
        { label: "Hợp đồng", to: ROUTES.CONTRACTS },
        {
          label: contract.contractNumber,
          to: ROUTES.contractDetailPath(contract.id),
        },
        { label: "Thanh lý" },
      ]}
    >
      {actions.canLiquidate ? (
        <>
          <Alert className="border-warning/20 bg-warning/10">
            <AlertTriangle className="text-warning" />
            <AlertDescription className="text-warning-foreground-strong">
              Thanh lý hợp đồng là quá trình không thể hoàn tác. Vui lòng kiểm
              tra kỹ thông tin trước khi xác nhận.
            </AlertDescription>
          </Alert>
          <LiquidationFlow
            key={contract.id}
            contract={contract}
            outstandingDebt={outstandingDebt}
          />
        </>
      ) : (
        <EmptyPanel
          icon={FileX}
          title="Không thể thanh lý"
          description={actions.blockedReason}
          className="border"
        />
      )}
    </DetailPageShell>
  );
}

const FORM_ID = "liquidation-form";

/** Mounted only once the Hợp đồng and its Hoá đơn are known. */
function LiquidationFlow({
  contract,
  outstandingDebt,
}: {
  contract: Contract;
  outstandingDebt: number;
}) {
  const navigate = useNavigate();
  const liquidate = useLiquidateContract();
  const form = useForm<LiquidationFormInput, unknown, LiquidationFormValues>({
    resolver: zodResolver(liquidationFormSchema),
    defaultValues: { decision: undefined, returnAmount: "", reason: "" },
  });
  const [decision, returnAmount] = useWatch({
    control: form.control,
    name: ["decision", "returnAmount"],
  });

  const settlement = decision
    ? computeDepositSettlement({
        depositAmount: contract.depositAmount,
        outstandingDebt,
        decision,
        partialReturnAmount: returnAmount ? Number(returnAmount) : undefined,
      })
    : null;

  const onSubmit = form.handleSubmit((values) => {
    // The submit button is disabled until `decision` is chosen, so this is
    // always non-null in practice — guarded here to satisfy the type.
    if (!settlement) return;
    liquidate.mutate(
      {
        contractId: contract.id,
        decision: values.decision,
        returnedAmount: settlement.returnedAmount,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.add({
            title: `Đã thanh lý hợp đồng ${contract.contractNumber}`,
            type: "success",
          });
          navigate(ROUTES.contractDetailPath(contract.id));
        },
      },
    );
  });

  return (
    <form
      id={FORM_ID}
      onSubmit={onSubmit}
      noValidate
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Số hợp đồng" value={contract.contractNumber} />
            <InfoRow label="Người thuê" value={contract.tenant} />
            <InfoRow label="Phòng" value={contract.room} />
            <InfoRow
              label="Tiền đặt cọc"
              value={formatCurrency(contract.depositAmount)}
            />
            <InfoRow
              label="Nợ thật (Hoá đơn chưa thu đủ)"
              value={
                outstandingDebt > 0
                  ? formatCurrency(outstandingDebt)
                  : "Không có"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quyết toán Cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="decision"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Cách quyết toán</FieldLabel>
                  <RadioGroup
                    id={field.name}
                    // Base UI treats an `undefined` first value as "uncontrolled"
                    // and warns (or worse) on the first real selection — "" is a
                    // defined value that matches no item, so it stays controlled
                    // from the very first render.
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Seed a sensible default the landlord can still edit down.
                      if (value === "PARTIAL_RETURNED") {
                        form.setValue(
                          "returnAmount",
                          String(
                            Math.max(
                              0,
                              contract.depositAmount - outstandingDebt,
                            ),
                          ),
                        );
                      }
                    }}
                    aria-invalid={fieldState.invalid}
                  >
                    {liquidationDecisionOptions.map((option) => (
                      <FieldLabel
                        key={option.value}
                        htmlFor={`${field.name}-${option.value}`}
                        className="flex items-center gap-2 font-normal"
                      >
                        <RadioGroupItem
                          id={`${field.name}-${option.value}`}
                          value={option.value}
                        />
                        {option.label}
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {decision === "PARTIAL_RETURNED" && (
              <>
                <CurrencyField
                  control={form.control}
                  name="returnAmount"
                  label="Số tiền hoàn lại"
                  required
                  description={`Còn lại sau nợ: ${formatCurrency(settlement?.availableAfterDebt ?? 0)}`}
                />
                <Controller
                  name="reason"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Lý do</FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={3}
                        placeholder="VD: hư hỏng nội thất, thiếu tài sản bàn giao…"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-info/20 bg-info/10">
          <CardHeader>
            <CardTitle className="text-base">Số trả lại</CardTitle>
          </CardHeader>
          <CardContent>
            {settlement ? (
              <>
                <p className="text-[20px] font-semibold tabular-nums">
                  {formatCurrency(settlement.returnedAmount)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Cọc {formatCurrency(contract.depositAmount)} − nợ{" "}
                  {formatCurrency(outstandingDebt)}.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Chọn cách quyết toán để xem số trả lại.
              </p>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          form={FORM_ID}
          className="w-full"
          disabled={liquidate.isPending || !decision}
        >
          {liquidate.isPending ? "Đang xử lý..." : "Xác nhận thanh lý"}
        </Button>
      </div>
    </form>
  );
}
