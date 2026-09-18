import { useState } from "react";
import { Edit, Receipt, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import { toast } from "@monorepo/ui/components/toast";

import { ReceiptAttachment } from "~/components/attachment/receipt-attachment";
import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
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
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: bill, isLoading } = useGetSupplierBill(billId);
  const deleteBill = useDeleteSupplierBill();

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.SUPPLIER_BILLS}>
        <DetailSkeleton />
      </DetailPageShell>
    );
  }

  if (!bill) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.SUPPLIER_BILLS}>
        <EmptyPanel
          icon={Receipt}
          title="Không tìm thấy hoá đơn nhà cung cấp."
          description={`Không có hoá đơn nào với mã ${billId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const handleDelete = () =>
    deleteBill.mutate(bill.id, {
      onSuccess: () => {
        toast.add({ title: "Đã xóa hoá đơn nhà cung cấp", type: "success" });
        setIsDeleteOpen(false);
        navigate(ROUTES.SUPPLIER_BILLS, { replace: true });
      },
    });

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
              onClick={() => setIsDeleteOpen(true)}
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

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa hoá đơn nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa hoá đơn của "${bill.supplierName}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        isPending={deleteBill.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
