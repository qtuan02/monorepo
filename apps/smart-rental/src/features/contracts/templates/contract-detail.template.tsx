import { useState } from "react";
import { AlertCircle, Calendar, FileX, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";
import { cn } from "@monorepo/ui/utils/cn";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { DataTable } from "~/components/data-table/data-table";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig, depositStatusConfig } from "~/constants/status";
import { getContractLifecycleSteps } from "~/features/contracts/utils/contract-lifecycle";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import { utilityColumns } from "~/features/utilities/components/utility-columns";
import { useDeleteContract, useGetContract } from "~/hooks/api/contract";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetUtilities } from "~/hooks/api/utility";
import {
  canDeleteContract,
  daysUntilContractEnd,
  isContractLive,
} from "~/utils/contract-status";
import { formatCurrency } from "~/utils/currency";
import { formatDateTime } from "~/utils/date";

interface ContractDetailTemplateProps {
  contractId: string;
}

const TITLE = "Chi tiết hợp đồng";

/**
 * "Chi tiết hợp đồng": the shared detail anatomy (spec #153 §3.4) — header
 * entity + tabs (Tổng quan · Hoá đơn · Chỉ số · Lịch sử), a right column
 * carrying only Cọc, vòng đời and links. Each fact appears once: room/tenant/
 * dates live in the header meta, not repeated inside a tab.
 */
export default function ContractDetailTemplate({
  contractId,
}: ContractDetailTemplateProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: contract, isLoading } = useGetContract(contractId);
  const deleteContract = useDeleteContract();
  const invoicesQuery = useGetInvoices({ contractId }, { enabled: !!contract });
  const utilitiesQuery = useGetUtilities(
    { roomId: contract?.roomId },
    { enabled: !!contract },
  );

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.CONTRACTS}>
        <DetailSkeleton />
      </DetailPageShell>
    );
  }

  if (!contract) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.CONTRACTS}>
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
  const deposit = depositStatusConfig[contract.depositStatus];
  const isLive = isContractLive(contract);
  const daysUntilEnd = daysUntilContractEnd(contract.endDate);

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
    <DetailPageShell
      title={TITLE}
      backTo={ROUTES.CONTRACTS}
      name={contract.contractNumber}
      badge={<StatusBadge config={status} />}
      meta={[
        <Link
          key="room"
          to={ROUTES.roomDetailPath(contract.roomId)}
          className="hover:text-foreground underline-offset-2 hover:underline"
        >
          {contract.room}
        </Link>,
        <Link
          key="tenant"
          to={ROUTES.tenantDetailPath(contract.tenantId)}
          className="hover:text-foreground underline-offset-2 hover:underline"
        >
          {contract.tenant}
        </Link>,
        `${contract.startDate} → ${contract.endDate}`,
      ]}
      actions={
        isLive ? (
          <>
            <Link
              to={ROUTES.contractRenewPath(contract.id)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Calendar />
              Gia hạn
            </Link>
            <Link
              to={ROUTES.contractLiquidationPath(contract.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-destructive hover:text-destructive",
              )}
            >
              <FileX />
              Thanh lý
            </Link>
          </>
        ) : canDeleteContract(contract) ? (
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
        ) : undefined
      }
      tabs={[
        {
          value: "overview",
          label: "Tổng quan",
          content: (
            <>
              {contract.status === "EXPIRING" && daysUntilEnd >= 0 && (
                <Alert className="border-warning/20 bg-warning/10">
                  <AlertCircle className="text-warning" />
                  <AlertDescription className="text-warning-foreground-strong">
                    Hợp đồng sẽ hết hạn trong {daysUntilEnd} ngày. Vui lòng gia
                    hạn hoặc liên hệ Người thuê.
                  </AlertDescription>
                </Alert>
              )}
              <InfoCard title="Điều khoản">
                <InfoRow
                  label="Tiền thuê"
                  value={`${formatCurrency(contract.rentAmount)} / tháng`}
                  isHighlighted
                />
                <InfoRow
                  label="Báo trước"
                  value={`${contract.noticeDays} ngày`}
                />
              </InfoCard>
            </>
          ),
        },
        {
          value: "invoices",
          label: `Hoá đơn (${invoicesQuery.data?.length ?? 0})`,
          content: (
            <DataTable
              columns={invoiceColumns}
              data={invoicesQuery.data ?? []}
              getRowId={(invoice) => invoice.id}
              empty={{
                icon: FileX,
                title: "Chưa có hoá đơn",
                description: "Hợp đồng này chưa có hoá đơn nào được lập.",
              }}
            />
          ),
        },
        {
          value: "utilities",
          label: "Chỉ số",
          content: (
            <DataTable
              columns={utilityColumns}
              data={utilitiesQuery.data ?? []}
              getRowId={(utility) => utility.id}
              empty={{
                title: "Chưa có chỉ số",
                description: "Phòng này chưa có chỉ số điện nước nào.",
              }}
            />
          ),
        },
        {
          value: "history",
          label: "Lịch sử",
          content: <HistoryTab contract={contract} />,
        },
      ]}
      sidebar={
        <>
          <InfoCard title="Cọc">
            <StatItem
              label="Số tiền"
              value={formatCurrency(contract.depositAmount)}
              valueClassName="text-lg font-bold"
            />
            <StatusBadge config={deposit} />
            <p className="text-muted-foreground text-xs">
              {contract.depositStatus === "HELD"
                ? "Hoàn khi thanh lý."
                : `Đã hoàn ${formatCurrency(contract.depositReturnedAmount)}.`}
            </p>
          </InfoCard>

          <InfoCard title="Vòng đời">
            <LifecycleStepper
              steps={getContractLifecycleSteps(contract.status)}
            />
          </InfoCard>
        </>
      }
    >
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

/** Lịch sử: mỗi Gia hạn, rồi bản ghi Thanh lý nếu Hợp đồng đã kết thúc theo cách đó. */
function HistoryTab({
  contract,
}: {
  contract: NonNullable<ReturnType<typeof useGetContract>["data"]>;
}) {
  const hasHistory =
    contract.renewalHistory.length > 0 || contract.status === "TERMINATED";

  if (!hasHistory) {
    return (
      <EmptyPanel
        title="Chưa có lịch sử"
        description="Hợp đồng này chưa từng được gia hạn hay thanh lý."
        className="border"
      />
    );
  }

  return (
    <div className="space-y-3">
      {contract.renewalHistory.map((entry, index) => (
        <InfoCard
          // biome-ignore lint/suspicious/noArrayIndexKey: renewalHistory is append-only and carries no id of its own.
          key={`renewal-${index}`}
          title={`Gia hạn · ${formatDateTime(entry.renewedAt)}`}
        >
          <InfoRow
            label="Ngày kết thúc"
            value={`${entry.previousEndDate} → ${entry.newEndDate}`}
          />
          <InfoRow
            label="Tiền thuê"
            value={`${formatCurrency(entry.previousRentAmount)} → ${formatCurrency(entry.newRentAmount)}`}
          />
        </InfoCard>
      ))}

      {contract.status === "TERMINATED" && contract.terminatedAt && (
        <InfoCard title={`Thanh lý · ${contract.terminatedAt}`}>
          <InfoRow
            label="Quyết toán Cọc"
            value={depositStatusConfig[contract.depositStatus].label}
          />
          <InfoRow
            label="Đã hoàn"
            value={formatCurrency(contract.depositReturnedAmount)}
          />
          {contract.terminationReason && (
            <InfoRow label="Lý do" value={contract.terminationReason} />
          )}
        </InfoCard>
      )}
    </div>
  );
}
