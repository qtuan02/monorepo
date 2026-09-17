import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Download,
  Edit,
  Printer,
  ReceiptText,
  Trash2,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Separator } from "@monorepo/ui/components/separator";

import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import { invoiceStatusConfig } from "~/constants/status";
import VietQrDialog from "~/features/invoices/components/vietqr-dialog";
import { useGetInvoice } from "~/hooks/api/invoice";
import { formatCurrency } from "~/utils/currency";

interface InvoiceDetailTemplateProps {
  invoiceId: string;
}

const TITLE = "Chi tiết hóa đơn";

/**
 * "Chi tiết hóa đơn": the amount, the Người thuê, the payment state and the
 * VietQR dialog. "Tải PDF", "Chỉnh sửa", "In hóa đơn", "Xem hồ sơ khách" and
 * the two "thanh toán" confirmations have no flow yet, as in the prototype;
 * "Xóa" confirms and lands back on the list, which is all the prototype did.
 */
export default function InvoiceDetailTemplate({
  invoiceId,
}: InvoiceDetailTemplateProps) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: invoice, isLoading } = useGetInvoice(invoiceId);

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
        disabled={!invoice}
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash2 />
        Xóa
      </Button>
    </>
  );

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.INVOICES} actions={actions}>
        <LoadingPanel itemCount={3} />
      </DetailPageShell>
    );
  }

  if (!invoice) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.INVOICES} actions={actions}>
        <EmptyPanel
          icon={ReceiptText}
          title="Không tìm thấy hóa đơn."
          description={`Không có hóa đơn nào với mã ${invoiceId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const status = invoiceStatusConfig[invoice.status];

  return (
    <DetailPageShell title={TITLE} backTo={ROUTES.INVOICES} actions={actions}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Tháng {invoice.month}
                  </CardDescription>
                </div>
                <StatusBadge config={status} />
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <dl className="from-primary/5 to-primary/10 border-primary/20 rounded-lg border bg-linear-to-br p-6">
                <StatItem
                  label="Tổng số tiền"
                  value={formatCurrency(invoice.amount)}
                  valueClassName="text-4xl font-bold tabular-nums"
                />
              </dl>
            </CardContent>
          </Card>

          <InfoCard title="Thông tin khách thuê">
            <InfoRow label="Tên khách" value={invoice.tenant} isHighlighted />
            <InfoRow label="Phòng" value={invoice.room} />
            <InfoRow label="Tầng" value={`Tầng ${invoice.floor}`} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              <User />
              Xem hồ sơ khách
            </Button>
          </InfoCard>

          <InfoCard title="Chi tiết hóa đơn">
            <InfoRow
              label="Tiền thuê phòng"
              value={formatCurrency(invoice.amount)}
            />
            <InfoRow label="Phí dịch vụ" value={formatCurrency(0)} />
            <InfoRow label="Các khoản khác" value={formatCurrency(0)} />
            <Separator />
            <InfoRow
              label="Tổng cộng"
              value={formatCurrency(invoice.amount)}
              isHighlighted
            />
          </InfoCard>

          <InfoCard title="Thông tin thanh toán">
            <InfoRow label="Ngày đến hạn" value={invoice.dueDate} />
            {invoice.paymentDate && (
              <InfoRow
                label="Ngày thanh toán"
                value={invoice.paymentDate}
                isHighlighted
              />
            )}
            <InfoRow label="Trạng thái" value={status.label} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
            >
              <CheckCircle2 />
              Đánh dấu đã thanh toán
            </Button>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng thái thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <StatusBadge
                  config={status}
                  className="w-full justify-center"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground size-4" />
                  Hạn: {invoice.dueDate}
                </p>
                {invoice.paymentDate && (
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Thanh toán: {invoice.paymentDate}
                  </p>
                )}
              </div>
              <Separator />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <CheckCircle2 />
                Xác nhận thanh toán
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <StatItem
                  label="Mã hóa đơn"
                  value={invoice.invoiceNumber}
                  valueClassName="font-mono text-sm"
                />
                <Separator />
                <StatItem
                  label="Số tiền"
                  value={formatCurrency(invoice.amount)}
                  valueClassName="text-lg font-bold"
                />
                <Separator />
                <StatItem
                  label="Cập nhật"
                  value={invoice.lastUpdated}
                  valueClassName="text-muted-foreground text-sm font-normal"
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <VietQrDialog
                amount={invoice.amount}
                invoiceNumber={invoice.invoiceNumber}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download />
                Tải PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Printer />
                In hóa đơn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa hóa đơn"
        description={`Bạn có chắc chắn muốn xóa hóa đơn "${invoice.invoiceNumber}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        onConfirm={() => navigate(ROUTES.INVOICES, { replace: true })}
      />
    </DetailPageShell>
  );
}
