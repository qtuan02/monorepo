import { useState } from "react";
import { Edit, Receipt, Trash2 } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

import { ReceiptAttachment } from "~/components/attachment/receipt-attachment";
import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { ROUTES } from "~/constants/routes";
import {
  supplierBillPaymentConfig,
  supplierBillTypeConfig,
} from "~/constants/status";
import SupplierBillFormSheet from "~/features/supplier-bills/components/supplier-bill-form-sheet";
import { getSupplierBillPaymentStatus } from "~/features/supplier-bills/utils/supplier-bill-payment";
import {
  useDeleteSupplierBill,
  useGetSupplierBill,
} from "~/hooks/api/supplier-bill";
import { useDeleteEntity } from "~/hooks/use-delete-entity";
import { formatCurrency } from "~/utils/currency";
import { formatDate, formatMonth } from "~/utils/date";

interface SupplierBillDetailTemplateProps {
  billId: string;
}

const TITLE = "Chi tiết hoá đơn nhà cung cấp";

/**
 * "Chi tiết hoá đơn nhà cung cấp" (spec #153 §10 row 35): header entity +
 * facts, no tabs — no relation of its own to show. Trạng thái stays derived
 * from `paymentDate` (`getSupplierBillPaymentStatus`, ADR-0012); xoá is
 * unconditional (§10 row 37 names no restriction here).
 */
export default function SupplierBillDetailTemplate({
  billId,
}: SupplierBillDetailTemplateProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const billQuery = useGetSupplierBill(billId);
  const bill = billQuery.data;

  const deleteBill = useDeleteEntity({
    mutation: useDeleteSupplierBill(),
    id: bill?.id ?? "",
    label: "hoá đơn nhà cung cấp",
    entity: bill?.supplierName,
    successMessage: "Đã xóa hoá đơn nhà cung cấp",
    redirectTo: ROUTES.SUPPLIER_BILLS,
  });

  if (!bill) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.SUPPLIER_BILLS}
        query={billQuery}
        id={billId}
        notFound={(id) => ({
          icon: Receipt,
          title: "Không tìm thấy hoá đơn nhà cung cấp.",
          description: `Không có hoá đơn nào với mã ${id}.`,
        })}
      />
    );
  }

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.SUPPLIER_BILLS}
        name={bill.supplierName}
        badge={
          <StatusBadge
            config={
              supplierBillPaymentConfig[getSupplierBillPaymentStatus(bill)]
            }
          />
        }
        meta={[
          bill.buildingName,
          supplierBillTypeConfig[bill.type].label,
          formatMonth(bill.billingPeriod),
        ]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit />
              Chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={deleteBill.onOpen}
            >
              <Trash2 />
              Xóa
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <InfoCard title="Thông tin hoá đơn">
            <InfoRow label="Mã hoá đơn" value={bill.id} />
            <InfoRow label="Toà nhà" value={bill.buildingName} />
            <InfoRow
              label="Loại dịch vụ"
              value={supplierBillTypeConfig[bill.type].label}
            />
            <InfoRow label="Nhà cung cấp" value={bill.supplierName} />
            <InfoRow
              label="Kỳ hoá đơn"
              value={formatMonth(bill.billingPeriod)}
            />
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

          <InfoCard title="Ảnh hoá đơn">
            <ReceiptAttachment src={bill.invoiceImageUrl} label="Hoá đơn" />
          </InfoCard>
        </div>
      </DetailPageShell>

      <SupplierBillFormSheet
        bill={bill}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmActionDialog {...deleteBill.dialogProps} />
    </>
  );
}
