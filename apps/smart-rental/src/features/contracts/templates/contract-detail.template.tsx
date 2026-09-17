import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  Edit,
  FileText,
  FileX,
  Trash2,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Separator } from "@monorepo/ui/components/separator";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig } from "~/constants/status";
import AssetChecklist from "~/features/contracts/components/asset-checklist";
import { getContractExpiryMeta } from "~/features/contracts/utils/contract-expiry";
import { getContractLifecycleSteps } from "~/features/contracts/utils/contract-lifecycle";
import { useDeleteContract, useGetContract } from "~/hooks/api/contract";
import { formatCurrency } from "~/utils/currency";

interface ContractDetailTemplateProps {
  contractId: string;
}

const TITLE = "Chi tiết hợp đồng";

/**
 * "Chi tiết hợp đồng". "Tải PDF", "Chỉnh sửa", "In hợp đồng" and "Xem hồ sơ
 * Người thuê" have no flow yet, as in the prototype; "Xóa" confirms, then removes
 * the entry from the Mock. Gia hạn and Thanh lý link to their screens.
 */
export default function ContractDetailTemplate({
  contractId,
}: ContractDetailTemplateProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: contract, isLoading } = useGetContract(contractId);
  const deleteContract = useDeleteContract();

  const actions = (
    <>
      <Button type="button" variant="outline" size="sm">
        <Download />
        Tải PDF
      </Button>
      <Button type="button" variant="outline" size="sm">
        <Edit />
        Chỉnh sửa
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 />
        Xóa
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.CONTRACTS}
        actions={actions}
      >
        <LoadingPanel itemCount={3} />
      </DetailPageShell>
    );
  }

  if (!contract) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.CONTRACTS}
        actions={actions}
      >
        <EmptyPanel
          icon={FileX}
          title="Không tìm thấy hợp đồng"
          description={`Không có hợp đồng nào với mã ${contractId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const status = contractStatusConfig[contract.status];
  const expiry = getContractExpiryMeta(contract.endDate);
  const isEnded =
    contract.status === "EXPIRED" || contract.status === "TERMINATED";

  const handleDelete = () =>
    deleteContract.mutate(contract.id, {
      onSuccess: () => {
        toast.add({
          title: `Đã xóa hợp đồng ${contract.contractNumber}`,
          type: "success",
        });
        setIsDeleteOpen(false);
        navigate(ROUTES.CONTRACTS, { replace: true });
      },
    });

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.CONTRACTS} actions={actions}>
      {expiry.isExpiringSoon && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>
            Hợp đồng sẽ hết hạn trong {expiry.daysUntilEnd} ngày. Vui lòng gia
            hạn hoặc liên hệ Người thuê.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    {contract.contractNumber}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Ký kết: {contract.startDate}
                  </CardDescription>
                </div>
                <StatusBadge config={status} />
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <StatItem label="Ngày bắt đầu" value={contract.startDate} />
                <StatItem label="Ngày kết thúc" value={contract.endDate} />
              </dl>
            </CardContent>
          </Card>

          <InfoCard title="Thông tin Người thuê">
            <InfoRow label="Tên Người thuê" value={contract.tenant} isHighlighted />
            <InfoRow label="Phòng" value={contract.room} />
            <InfoRow label="Tầng" value={`Tầng ${contract.floor}`} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              <User />
              Xem hồ sơ Người thuê
            </Button>
          </InfoCard>

          <InfoCard title="Điều khoản hợp đồng">
            <dl className="space-y-3">
              <StatItem label="Thời hạn hợp đồng" value="12 tháng" />
              <Separator />
              <StatItem
                label="Tiền thuê hàng tháng"
                value={formatCurrency(contract.rentAmount)}
                valueClassName="font-bold"
              />
              <Separator />
              <StatItem
                label="Tiền đặt cọc"
                value={formatCurrency(contract.depositAmount)}
                valueClassName="font-bold"
              />
              <Separator />
              <StatItem label="Loại hợp đồng" value="Hợp đồng dài hạn" />
            </dl>
          </InfoCard>

          <InfoCard title="Thời gian hợp đồng">
            <InfoRow label="Ngày bắt đầu" value={contract.startDate} />
            <InfoRow
              label="Ngày kết thúc"
              value={contract.endDate}
              isHighlighted
            />
            <InfoRow label="Thời hạn" value="12 tháng" />
            {expiry.isExpiringSoon && (
              <InfoRow
                label="Cảnh báo"
                value={<span className="text-destructive">Sắp hết hạn</span>}
              />
            )}
          </InfoCard>

          <AssetChecklist />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <StatusBadge
                  config={status}
                  className="w-full justify-center"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Người thuê</p>
                <p className="text-muted-foreground">{contract.tenant}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Phòng</p>
                <p className="text-muted-foreground">{contract.room}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vòng đời hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <LifecycleStepper
                steps={getContractLifecycleSteps(contract.status)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin tài chính</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <StatItem
                  label="Tiền thuê/tháng"
                  value={formatCurrency(contract.rentAmount)}
                  valueClassName="text-lg font-bold"
                />
                <Separator />
                <StatItem
                  label="Tiền đặt cọc"
                  value={formatCurrency(contract.depositAmount)}
                  valueClassName="text-lg font-bold"
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <FileText />
                In hợp đồng
              </Button>
              {isEnded ? (
                <p className="text-muted-foreground text-center text-xs">
                  Hợp đồng đã kết thúc.
                </p>
              ) : (
                <>
                  <Link
                    to={ROUTES.contractRenewPath(contract.id)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full",
                    )}
                  >
                    <Calendar />
                    Gia hạn
                  </Link>
                  <Link
                    to={ROUTES.contractLiquidationPath(contract.id)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "text-destructive hover:text-destructive w-full",
                    )}
                  >
                    <FileX />
                    Thanh lý
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa hợp đồng"
        description={`Bạn có chắc chắn muốn xóa hợp đồng "${contract.contractNumber}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteContract.isPending}
        onConfirm={handleDelete}
      />
    </DetailPageShell>
  );
}
