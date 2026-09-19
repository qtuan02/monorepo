import { useState } from "react";
import { Bell, Printer, ReceiptText, Trash2 } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
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
import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import SendReminderDialog from "~/components/dialog/send-reminder-dialog";
import VietQrDialog from "~/components/dialog/vietqr-dialog";
import { DetailPageShell } from "~/components/page/detail-page-shell";
import { EmptyPanel } from "~/components/panel/empty-panel";
import PaymentFormSheet from "~/components/sheet/payment-form-sheet";
import { ROUTES } from "~/constants/routes";
import {
  channelConfig,
  invoicePaymentMethodConfig,
  invoiceStatusConfig,
} from "~/constants/status";
import { useGetBuilding } from "~/hooks/api/building";
import { useDeleteInvoice, useGetInvoice } from "~/hooks/api/invoice";
import { useDeleteEntity } from "~/hooks/use-delete-entity";
import { formatCurrency } from "~/utils/currency";
import { formatDateTime } from "~/utils/date";
import { canDeleteInvoice, daysOverdue } from "~/utils/invoice-status";

interface InvoiceDetailTemplateProps {
  invoiceId: string;
}

const TITLE = "Chi tiết hoá đơn";

/** "Tổng quan": dòng theo loại, Tổng cộng một lần — "Đã trả"/"Còn lại" sống ở tab Thanh toán. */
function OverviewTab({ invoice }: { invoice: Invoice }) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";

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
    </InfoCard>
  );
}

/**
 * "Thanh toán": mỗi khoản đã ghi nhận, cộng "Còn lại" — the one entry point
 * to record a new payment is the header's "Ghi nhận thu n đ" (spec #179
 * §"Thu tiền và chi tiết Hoá đơn"), so this tab stays read-only.
 */
function PaymentsTab({ invoice }: { invoice: Invoice }) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";
  const remaining = invoice.amount - invoice.paidAmount;

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

      <InfoRow
        label="Còn lại"
        value={
          <span className={remaining > 0 ? "text-destructive" : undefined}>
            {formatCurrency(remaining)}
          </span>
        }
        isHighlighted
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
 * "Chi tiết hoá đơn": mỗi dữ kiện một chỗ (spec #179 §"Thu tiền và chi tiết
 * Hoá đơn") — header entity + tabs (Tổng quan · Thanh toán · Nhắc nợ), không
 * còn card "Tóm tắt" bên phải (những dữ kiện đó đã ở meta/tab). "Ghi nhận thu
 * n đ" là hành động chính, điền sẵn phần còn lại — cùng `PaymentFormSheet`
 * VietQR's "Đã nhận" ghi qua. VietQR ẩn khi còn lại = 0. "Xóa" is fake and
 * gated to Nháp, as every other entity in this app; "In hoá đơn" is the only
 * export path (spec #153 §10 row 30 — no real PDF).
 */
export default function InvoiceDetailTemplate({
  invoiceId,
}: InvoiceDetailTemplateProps) {
  // See RemindersTab's own "use no memo" for why every tab here needs it.
  "use no memo";
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const invoiceQuery = useGetInvoice(invoiceId);
  const invoice = invoiceQuery.data;
  const { data: building } = useGetBuilding(invoice?.buildingId ?? "", {
    enabled: !!invoice?.buildingId,
  });

  const deleteInvoice = useDeleteEntity({
    mutation: useDeleteInvoice(),
    id: invoice?.id ?? "",
    label: "hoá đơn",
    entity: invoice?.invoiceNumber,
    successMessage: `Đã xóa hoá đơn ${invoice?.invoiceNumber}`,
    redirectTo: ROUTES.INVOICES,
  });

  if (!invoice) {
    return (
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.INVOICES}
        query={invoiceQuery}
        id={invoiceId}
        notFound={(id) => ({
          icon: ReceiptText,
          title: "Không tìm thấy hoá đơn.",
          description: `Không có hoá đơn nào với mã ${id}.`,
        })}
      />
    );
  }

  const remaining = invoice.amount - invoice.paidAmount;
  const status =
    invoice.status === "OVERDUE"
      ? {
          ...invoiceStatusConfig.OVERDUE,
          label: `Quá hạn ${daysOverdue(invoice.dueDate)} ngày`,
        }
      : invoiceStatusConfig[invoice.status];

  return (
    <>
      <DetailPageShell
        title={TITLE}
        backTo={ROUTES.INVOICES}
        name={invoice.invoiceNumber}
        badge={<StatusBadge config={status} />}
        meta={[
          invoice.room,
          invoice.tenant,
          `Kỳ ${invoice.month} · Hạn thu ${invoice.dueDate}`,
        ]}
        actions={
          <>
            {remaining > 0 && (
              <Button
                type="button"
                size="sm"
                className="print:hidden"
                onClick={() => setIsPaymentOpen(true)}
              >
                Ghi nhận thu {formatCurrency(remaining)}
              </Button>
            )}
            <VietQrDialog
              invoiceId={invoice.id}
              amount={remaining}
              invoiceNumber={invoice.invoiceNumber}
              room={invoice.room}
              bankAccount={building?.bankAccount}
              buildingId={invoice.buildingId ?? ""}
              variant="outline"
              size="sm"
              className="print:hidden"
            />
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
                onClick={deleteInvoice.onOpen}
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
      />

      <PaymentFormSheet
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
        defaultAmount={remaining}
      />

      <ConfirmActionDialog {...deleteInvoice.dialogProps} />
    </>
  );
}
