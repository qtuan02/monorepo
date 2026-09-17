import { useState } from "react";
import { Bell, Download, Printer, ReceiptText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import { Progress } from "@monorepo/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import type { Invoice } from "~/types/invoice";
import { StatusBadge } from "~/components/badge/status-badge";
import { InfoCard, InfoRow } from "~/components/card/info-card";
import { StatItem } from "~/components/card/stat-item";
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { CardGridSkeleton } from "~/components/panel/loading-panel";
import { ROUTES } from "~/constants/routes";
import {
  channelConfig,
  invoicePaymentMethodConfig,
  invoiceStatusConfig,
} from "~/constants/status";
import PaymentFormSheet from "~/features/invoices/components/payment-form-sheet";
import SendReminderDialog from "~/features/invoices/components/send-reminder-dialog";
import VietQrDialog from "~/features/invoices/components/vietqr-dialog";
import { useGetBuilding } from "~/hooks/api/building";
import { useGetInvoice } from "~/hooks/api/invoice";
import { formatCurrency } from "~/utils/currency";
import { formatDateTime } from "~/utils/date";
import { canDeleteInvoice } from "~/utils/invoice-status";

interface InvoiceDetailTemplateProps {
  invoiceId: string;
}

const TITLE = "Chi tiết hoá đơn";

/** "Tổng quan": dòng theo loại, tổng/đã trả/còn lại, progress khi thu một phần. */
function OverviewTab({ invoice }: { invoice: Invoice }) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";
  const remaining = invoice.amount - invoice.paidAmount;
  const isPartial = invoice.paidAmount > 0 && remaining > 0;

  return (
    <InfoCard title="Chi tiết hoá đơn">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Khoản mục</TableHead>
            <TableHead className="text-right">SL</TableHead>
            <TableHead className="text-right">Đơn giá</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.lineItems.map((item, index) => (
            <TableRow
              // biome-ignore lint/suspicious/noArrayIndexKey: lineItems is a fixed, never-reordered snapshot with no id of its own.
              key={`${item.type}-${index}`}
            >
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right tabular-nums">
                {item.quantity}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Tổng cộng</TableCell>
            <TableCell className="text-right font-bold tabular-nums">
              {formatCurrency(invoice.amount)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
        <StatItem label="Tổng cộng" value={formatCurrency(invoice.amount)} />
        <StatItem
          label="Đã trả"
          value={formatCurrency(invoice.paidAmount)}
          valueClassName="text-success"
        />
        <StatItem
          label="Còn lại"
          value={formatCurrency(remaining)}
          valueClassName={remaining > 0 ? "text-destructive" : undefined}
        />
      </div>

      {isPartial && (
        <div>
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-sm">
            <span>Đã thu</span>
            <span className="font-semibold">
              {Math.round((invoice.paidAmount / invoice.amount) * 100)}%
            </span>
          </div>
          <Progress
            value={Math.round((invoice.paidAmount / invoice.amount) * 100)}
            aria-label="Đã thu"
          />
        </div>
      )}
    </InfoCard>
  );
}

/** "Thanh toán": mỗi khoản đã ghi nhận, cộng nút ghi thêm một khoản. */
function PaymentsTab({ invoice }: { invoice: Invoice }) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <InfoCard title="Lịch sử thanh toán">
      {invoice.payments.length === 0 ? (
        <EmptyPanel
          title="Chưa có khoản thanh toán nào"
          description="Ghi nhận khoản thu đầu tiên cho hoá đơn này."
        />
      ) : (
        <div className="space-y-3">
          {invoice.payments.map((payment, index) => (
            <InfoRow
              // biome-ignore lint/suspicious/noArrayIndexKey: payments is append-only and carries no id of its own.
              key={`payment-${index}`}
              label={`${payment.paidAt} · ${invoicePaymentMethodConfig[payment.method].label}`}
              value={formatCurrency(payment.amount)}
              isHighlighted
            />
          ))}
        </div>
      )}

      <Button type="button" size="sm" onClick={() => setIsSheetOpen(true)}>
        Ghi nhận Thanh toán
      </Button>

      <PaymentFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
      />
    </InfoCard>
  );
}

/** "Nhắc nợ": "đã nhắc n lần, lần cuối …" cộng nhật ký từng lần gửi. */
function RemindersTab({ invoice }: { invoice: Invoice }) {
  // React Compiler otherwise memoizes this panel's JSX onto a stale snapshot
  // of `invoice` — it never re-renders with fresh data while this Tab stays
  // the active one (only switching away and back "unsticks" it). Every
  // non-default DetailPageShell tab whose content changes from a same-screen
  // mutation (not a navigation) needs this same escape hatch.
  "use no memo";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const lastReminder = invoice.reminders.at(-1);

  return (
    <InfoCard title="Nhắc nợ">
      <p className="text-muted-foreground text-sm">
        {invoice.reminders.length === 0
          ? "Chưa gửi nhắc lần nào."
          : `Đã nhắc ${invoice.reminders.length} lần, lần cuối ${formatDateTime(lastReminder?.sentAt ?? new Date())} qua ${channelConfig[lastReminder?.channel ?? "zalo"].label}.`}
      </p>

      {invoice.reminders.length > 0 && (
        <div className="space-y-2">
          {invoice.reminders.map((reminder, index) => (
            <InfoRow
              // biome-ignore lint/suspicious/noArrayIndexKey: reminders is append-only and carries no id of its own.
              key={`reminder-${index}`}
              label={formatDateTime(reminder.sentAt)}
              value={channelConfig[reminder.channel].label}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
      >
        <Bell />
        Gửi nhắc
      </Button>

      <SendReminderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoiceIds={[invoice.id]}
      />
    </InfoCard>
  );
}

/**
 * "Chi tiết hoá đơn": the shared detail anatomy (spec #153 §3.4, §10 row 12)
 * — header entity + tabs (Tổng quan · Thanh toán · Nhắc nợ), a right column
 * carrying VietQR and the Hoá đơn's own fixed facts. "Chỉnh sửa" and "Tải
 * PDF" have no flow yet, as in the prototype; "Xóa" is fake and gated to
 * Nháp, as every other entity in this app.
 */
export default function InvoiceDetailTemplate({
  invoiceId,
}: InvoiceDetailTemplateProps) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: building } = useGetBuilding(invoice?.buildingId ?? "", {
    enabled: !!invoice?.buildingId,
  });

  if (isLoading) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.INVOICES}>
        <CardGridSkeleton itemCount={3} />
      </DetailPageShell>
    );
  }

  if (!invoice) {
    return (
      <DetailPageShell title={TITLE} backTo={ROUTES.INVOICES}>
        <EmptyPanel
          icon={ReceiptText}
          title="Không tìm thấy hoá đơn."
          description={`Không có hoá đơn nào với mã ${invoiceId}.`}
          className="border"
        />
      </DetailPageShell>
    );
  }

  const status = invoiceStatusConfig[invoice.status];

  return (
    <DetailPageShell
      title={TITLE}
      backTo={ROUTES.INVOICES}
      name={invoice.invoiceNumber}
      badge={<StatusBadge config={status} />}
      meta={[`Phòng ${invoice.room}`, invoice.tenant, `Kỳ ${invoice.month}`]}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer />
            In hoá đơn
          </Button>
          {canDeleteInvoice(invoice) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive print:hidden"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 />
              Xóa
            </Button>
          )}
        </>
      }
      tabs={[
        {
          value: "overview",
          label: "Tổng quan",
          content: <OverviewTab invoice={invoice} />,
        },
        {
          value: "payments",
          label: `Thanh toán (${invoice.payments.length})`,
          content: <PaymentsTab invoice={invoice} />,
        },
        {
          value: "reminders",
          label: "Nhắc nợ",
          content: <RemindersTab invoice={invoice} />,
        },
      ]}
      sidebar={
        <>
          <InfoCard title="Hành động" className="print:hidden">
            <VietQrDialog
              amount={invoice.amount - invoice.paidAmount}
              invoiceNumber={invoice.invoiceNumber}
              room={invoice.room}
              bankAccount={building?.bankAccount}
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
          </InfoCard>

          <InfoCard title="Tóm tắt">
            <StatItem
              label="Mã hoá đơn"
              value={invoice.invoiceNumber}
              valueClassName="font-mono text-sm"
            />
            <InfoRow label="Kỳ" value={invoice.month} />
            <InfoRow label="Hạn thu" value={invoice.dueDate} isHighlighted />
            <InfoRow label="Cập nhật" value={invoice.lastUpdated} />
          </InfoCard>
        </>
      }
    >
      <ConfirmActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa hoá đơn"
        description={`Bạn có chắc chắn muốn xóa hoá đơn "${invoice.invoiceNumber}" không? Hành động này không thể hoàn tác.`}
        actionLabel="Xóa"
        variant="destructive"
        onConfirm={() => navigate(ROUTES.INVOICES, { replace: true })}
      />
    </DetailPageShell>
  );
}
