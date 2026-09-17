import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, FileX } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { toast } from "@monorepo/ui/components/toast";

import type {
  LiquidationFormInput,
  LiquidationFormValues,
} from "~/features/contracts/types/liquidation-form";
import type { Contract } from "~/types/contract";
import { InfoRow } from "~/components/card/info-card";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import LiquidationChecklist from "~/features/contracts/components/liquidation-checklist";
import LiquidationSummaryCard from "~/features/contracts/components/liquidation-summary-card";
import { liquidationFormSchema } from "~/features/contracts/types/liquidation-form";
import { useGetContract, useLiquidateContract } from "~/hooks/api/contract";
import { formatCurrency } from "~/utils/currency";

interface ContractLiquidationTemplateProps {
  contractId: string;
}

const TITLE = "Thanh lý hợp đồng";

/** "Thanh lý hợp đồng": three steps behind a stepper; the last one rewrites the Mock. */
export default function ContractLiquidationTemplate({
  contractId,
}: ContractLiquidationTemplateProps) {
  const { data: contract, isLoading } = useGetContract(contractId);
  const backTo = ROUTES.contractDetailPath(contractId);

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={backTo}>
        <LoadingPanel itemCount={2} />
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
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertTriangle className="text-amber-600" />
        <AlertDescription className="text-amber-800">
          Thanh lý hợp đồng là quá trình không thể hoàn tác. Vui lòng kiểm tra
          kỹ thông tin trước khi xác nhận.
        </AlertDescription>
      </Alert>
      <LiquidationFlow key={contract.id} contract={contract} />
    </DetailPageShell>
  );
}

const flowSteps = [
  {
    id: "check-assets",
    title: "Kiểm tra tài sản",
    description: "Kiểm tra toàn bộ tài sản và điều kiện phòng",
  },
  {
    id: "settle-fees",
    title: "Thanh toán phí",
    description: "Tính toán và thanh toán các khoản phí",
  },
  {
    id: "finalize",
    title: "Hoàn tất",
    description: "Xác nhận thanh lý và hoàn trả tiền đặt cọc",
  },
];

/** The prototype's fixed settlement figures beside the Hợp đồng's own deposit. */
const OUTSTANDING_FEES = 500000;
const PENALTY_AMOUNT = 300000;

/** Mounted only once the Hợp đồng is known; the checklist is the form the last step submits. */
function LiquidationFlow({ contract }: { contract: Contract }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const liquidate = useLiquidateContract();
  const form = useForm<LiquidationFormInput, unknown, LiquidationFormValues>({
    resolver: zodResolver(liquidationFormSchema),
    defaultValues: {
      assetCheck: false,
      settleUtilities: false,
      collectKeys: false,
      finalInspection: false,
    },
  });
  const detailPath = ROUTES.contractDetailPath(contract.id);

  const steps = flowSteps.map((flowStep, index) => ({
    ...flowStep,
    isCompleted: index < step,
    isActive: index === step,
  }));

  const onSubmit = form.handleSubmit(() => {
    liquidate.mutate(contract.id, {
      onSuccess: () => {
        toast.add({
          title: `Đã thanh lý hợp đồng ${contract.contractNumber}`,
          type: "success",
        });
        navigate(detailPath);
      },
    });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Quy trình thanh lý</CardTitle>
        </CardHeader>
        <CardContent>
          <LifecycleStepper steps={steps} />
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} noValidate className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Số hợp đồng" value={contract.contractNumber} />
            <InfoRow label="Khách thuê" value={contract.tenant} />
            <InfoRow label="Phòng" value={contract.room} />
            <InfoRow
              label="Tiền đặt cọc"
              value={formatCurrency(contract.depositAmount)}
            />
            <InfoRow label="Ngày kết thúc" value={contract.endDate} />
          </CardContent>
        </Card>

        {step === 0 && (
          <LiquidationChecklist
            control={form.control}
            onCancel={() => navigate(detailPath)}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <>
            <LiquidationSummaryCard
              summary={{
                depositAmount: contract.depositAmount,
                outstandingFees: OUTSTANDING_FEES,
                penaltyAmount: PENALTY_AMOUNT,
              }}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chi tiết thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-3">
                  <p className="mb-3 text-sm font-medium">
                    Công nợ chưa thanh toán
                  </p>
                  <div className="space-y-2">
                    <InfoRow
                      label="Tiền nước tháng 03"
                      value={formatCurrency(200000)}
                    />
                    <InfoRow
                      label="Tiền điện tháng 04"
                      value={formatCurrency(300000)}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="mb-3 text-sm font-medium text-red-900">
                    Phí vi phạm
                  </p>
                  <p className="text-sm text-red-800">
                    Làm hỏng cửa sổ: {formatCurrency(PENALTY_AMOUNT)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
              >
                Quay lại
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                Tiếp tục: Hoàn tất
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="text-base text-emerald-900">
                  Sẵn sàng hoàn tất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-800">
                  Tất cả các bước đã được hoàn thành. Nhấp "Xác nhận thanh lý"
                  để hoàn tất quá trình.
                </p>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Quay lại
              </Button>
              <Button type="submit" disabled={liquidate.isPending}>
                {liquidate.isPending ? "Đang xử lý..." : "Xác nhận thanh lý"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
