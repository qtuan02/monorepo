import { AlertCircle, Calendar, FileX, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { Alert, AlertDescription } from "@monorepo/ui/components/alert";
import { Button, buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { DataTable } from "~/components/data-table/data-table";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { contractStatusConfig, depositStatusConfig } from "~/constants/status";
import { getContractLifecycleSteps } from "~/features/contracts/utils/contract-lifecycle";
import { invoiceColumns } from "~/features/invoices/components/invoice-columns";
import { utilityColumns } from "~/features/utilities/components/utility-columns";
import { useDeleteContract, useGetContract } from "~/hooks/api/contract";
import { useGetInvoices } from "~/hooks/api/invoice";
import { useGetUtilities } from "~/hooks/api/utility";
import { useDeleteEntity } from "~/hooks/use-delete-entity";
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
 * entity + tabs (Tổng quan · Hoá đơn · Chỉ số · Lịch sử). Vòng đời is a small
 * horizontal stepper in the header (spec #179 §10 row 16), so the right
 * column carries only Cọc and liên kết. Each fact appears once: room/tenant/
 * dates live in the header meta, not repeated inside a tab.
 */
export default function ContractDetailTemplate({
  contractId,
}: ContractDetailTemplateProps) {
  const contractQuery = useGetContract(contractId);
  const contract = contractQuery.data;
  const invoicesQuery = useGetInvoices({ contractId }, { enabled: !!contract });
  const utilitiesQuery = useGetUtilities(
    { roomId: contract?.roomId },
    { enabled: !!contract },
  );

  const deleteContract = useDeleteEntity({
    mutation: useDeleteContract(),
    id: contract?.id ?? "",
    label: "hợp đồng",
    entity: contract?.contractNumber,
    successMessage: `Đã xóa hợp đồng ${contract?.contractNumber}`,
    redirectTo: ROUTES.CONTRACTS,
  });

  if (!contract) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.CONTRACTS}
        query={contractQuery}
        id={contractId}
        notFound={(id) => ({
          icon: FileX,
          title: "Không tìm thấy hợp đồng",
          description: `Không có hợp đồng nào với mã ${id}.`,
        })}
      />
    );
  }

  const status = contractStatusConfig[contract.status];
  const deposit = depositStatusConfig[contract.depositStatus];
  const isLive = isContractLive(contract);
  const daysUntilEnd = daysUntilContractEnd(contract.endDate);

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
      headerStepper={
        <LifecycleStepper
          steps={getContractLifecycleSteps(contract.status)}
          orientation="horizontal"
        />
      }
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
            onClick={deleteContract.onOpen}
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
              query={invoicesQuery}
              getRowId={(invoice) => invoice.id}
              empty={{ icon: FileX, title: "Chưa có hoá đơn" }}
            />
          ),
        },
        {
          value: "utilities",
          label: "Chỉ số",
          content: (
            <DataTable
              columns={utilityColumns}
              query={utilitiesQuery}
              getRowId={(utility) => utility.id}
              empty={{ title: "Chưa có chỉ số" }}
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

          <InfoCard title="Liên kết">
            <Link
              to={ROUTES.roomDetailPath(contract.roomId)}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full",
              })}
            >
              Xem phòng
            </Link>
            <Link
              to={ROUTES.tenantDetailPath(contract.tenantId)}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full",
              })}
            >
              Xem người thuê
            </Link>
          </InfoCard>
        </>
      }
    >
      <ConfirmActionDialog {...deleteContract.dialogProps} />
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
          {entry.notes && <InfoRow label="Ghi chú" value={entry.notes} />}
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
