import { Receipt } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import {
  supplierBillPaymentConfig,
  supplierBillTypeConfig,
} from "~/constants/status";
import { getSupplierBillPaymentStatus } from "~/features/supplier-bills/utils/supplier-bill-payment";
import { useGetSupplierBill } from "~/hooks/api/supplier-bill";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

interface SupplierBillDetailTemplateProps {
  billId: string;
}

const TITLE = "Chi tiết hóa đơn nhà cung cấp";

/**
 * "Chi tiết hóa đơn nhà cung cấp": the amount and its status, the facts, and
 * the invoice image when the record carries one (the Mock has none yet).
 */
export default function SupplierBillDetailTemplate({
  billId,
}: SupplierBillDetailTemplateProps) {
  const { data: bill, isLoading } = useGetSupplierBill(billId);

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.SUPPLIER_BILLS}>
        <LoadingPanel itemCount={2} />
      </DetailPageShell>
    );
  }

  if (!bill) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.SUPPLIER_BILLS}>
        <EmptyPanel
          icon={Receipt}
          title="Không tìm thấy hóa đơn nhà cung cấp."
          description={`Không có hóa đơn nào với mã ${billId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.SUPPLIER_BILLS}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{bill.supplierName}</CardTitle>
            <StatusBadge
              config={
                supplierBillPaymentConfig[getSupplierBillPaymentStatus(bill)]
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(bill.totalAmount)}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Thông tin hóa đơn">
          <InfoRow label="Mã hóa đơn" value={bill.id} />
          <InfoRow label="Tòa nhà" value={bill.buildingName} />
          <InfoRow
            label="Loại dịch vụ"
            value={supplierBillTypeConfig[bill.type].label}
          />
          <InfoRow label="Nhà cung cấp" value={bill.supplierName} />
          <InfoRow label="Kỳ hóa đơn" value={bill.billingPeriod} />
          {bill.totalMeterIndex !== undefined && (
            <InfoRow label="Tổng chỉ số" value={bill.totalMeterIndex} />
          )}
          <InfoRow
            label="Số tiền"
            value={formatCurrency(bill.totalAmount)}
            isHighlighted
          />
          <InfoRow
            label="Ngày thanh toán"
            value={bill.paymentDate ? formatDate(bill.paymentDate) : "—"}
          />
        </InfoCard>

        <InfoCard title="Ảnh hóa đơn">
          {bill.invoiceImageUrl ? (
            <img
              src={bill.invoiceImageUrl}
              alt={`Hóa đơn ${bill.supplierName} kỳ ${bill.billingPeriod}`}
              className="w-full rounded-lg border object-contain"
            />
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Chưa có ảnh hóa đơn.
            </p>
          )}
        </InfoCard>
      </div>
    </DetailPageShell>
  );
}
