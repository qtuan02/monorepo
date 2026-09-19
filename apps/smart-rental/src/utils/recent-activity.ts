import type { CommunicationChannel } from "~/types/communication";
import type { Contract } from "~/types/contract";
import type { RecentActivityEntry } from "~/types/dashboard";
import type { Invoice } from "~/types/invoice";
import { channelConfig, invoicePaymentMethodConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";

/**
 * "Vừa xong" (spec #179 §"Hôm nay") — the `limit` most recent events across
 * three logs already in the Mock (Thanh toán, nhật ký Nhắc, lịch sử Gia hạn),
 * no Mock of its own. A batch "Nhắc tất cả" writes one reminder per Hoá đơn
 * at the same instant (see `~/hooks/api/invoice`'s `useSendInvoiceReminders`),
 * so reminders sharing the same `sentAt` + kênh collapse into one "Nhắc n
 * hoá đơn" entry rather than n identical rows.
 */
export function buildRecentActivity(
  sources: { invoices: Invoice[]; contracts: Contract[] },
  limit = 3,
): RecentActivityEntry[] {
  const entries: RecentActivityEntry[] = [];

  for (const invoice of sources.invoices) {
    for (const payment of invoice.payments) {
      entries.push({
        kind: "payment",
        at: payment.paidAt,
        // `invoice.room` is already "Phòng NNN" — never prefix it again.
        label: `Thu ${invoice.invoiceNumber} · ${invoice.room}`,
        detail: `${formatCurrency(payment.amount)} · ${invoicePaymentMethodConfig[payment.method].label}`,
      });
    }
  }

  const reminderBatches = new Map<
    string,
    { at: string; channel: CommunicationChannel; count: number }
  >();
  for (const invoice of sources.invoices) {
    for (const reminder of invoice.reminders) {
      const key = `${reminder.sentAt}-${reminder.channel}`;
      const batch = reminderBatches.get(key);
      if (batch) batch.count += 1;
      else {
        reminderBatches.set(key, {
          at: reminder.sentAt,
          channel: reminder.channel,
          count: 1,
        });
      }
    }
  }
  for (const batch of reminderBatches.values()) {
    entries.push({
      kind: "reminder",
      at: batch.at,
      label: `Nhắc ${batch.count} hoá đơn qua ${channelConfig[batch.channel].label}`,
      detail: "đã ghi nhật ký",
    });
  }

  for (const contract of sources.contracts) {
    for (const renewal of contract.renewalHistory) {
      entries.push({
        kind: "renewal",
        at: renewal.renewedAt,
        label: `Gia hạn ${contract.contractNumber} · ${contract.room}`,
        detail: `đến ${formatDate(renewal.newEndDate)}`,
      });
    }
  }

  return entries
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
