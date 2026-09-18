import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type { CommunicationChannel } from "~/types/communication";
import type {
  Invoice,
  InvoiceListParams,
  InvoicePaymentMethod,
} from "~/types/invoice";
import { mockInvoices } from "~/constants/mock/invoices";
import { taskQueryKeys } from "~/hooks/api/task";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate } from "~/utils/date";
import { sumInvoicePayments } from "~/utils/invoice-payments";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

/** `PARTIAL`/`PAID`/`OVERDUE` are never trusted from the Mock (ADR-0012) — recomputed on every read. */
function withDerivedStatus(invoice: Invoice): Invoice {
  return { ...invoice, status: deriveInvoiceStatus(invoice) };
}

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock, the Building scope as a query param.
const invoiceQueryKeyFactory = queryKeysFactory("invoice");

export const invoiceQueryKeys = {
  ...invoiceQueryKeyFactory,
  getInvoices: (params?: InvoiceListParams) =>
    invoiceQueryKeyFactory.list(params),
  getInvoice: (invoiceId: string) => invoiceQueryKeyFactory.detail(invoiceId),
};

export function useGetInvoices(
  params?: InvoiceListParams,
  options?: UseQueryOptionsWrapper<Invoice[]>,
): UseQueryResult<Invoice[], Error> {
  return useQuery<Invoice[], Error>({
    queryKey: invoiceQueryKeys.getInvoices(params),
    queryFn: async () =>
      mockInvoices
        .filter(
          (invoice) =>
            (!params?.buildingId || invoice.buildingId === params.buildingId) &&
            (!params?.contractId || invoice.contractId === params.contractId),
        )
        .map(withDerivedStatus),
    ...options,
  });
}

export function useGetInvoice(
  invoiceId: string,
  options?: UseQueryOptionsWrapper<Invoice | null>,
): UseQueryResult<Invoice | null, Error> {
  return useQuery<Invoice | null, Error>({
    queryKey: invoiceQueryKeys.getInvoice(invoiceId),
    queryFn: async () => {
      const invoice = mockInvoices.find((item) => item.id === invoiceId);
      return invoice ? withDerivedStatus(invoice) : null;
    },
    ...options,
  });
}

export interface RecordInvoicePaymentRequest {
  invoiceId: string;
  amount: number;
  method: InvoicePaymentMethod;
  /** ISO `YYYY-MM-DD`, as `DateField` hands it over. */
  paidAt: string;
}

/**
 * "Ghi nhận Thanh toán" (spec #153 §10 row 12) — appends one payment; the
 * status badge (Chưa thu → Thu một phần → Đã thu) is recomputed on the next
 * read, never written here (ADR-0012).
 */
export function useRecordInvoicePayment(
  options?: UseMutationOptionsWrapper<RecordInvoicePaymentRequest, Invoice>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RecordInvoicePaymentRequest) => {
      const invoice = mockInvoices.find(
        (item) => item.id === request.invoiceId,
      );
      if (!invoice) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy hoá đơn ${request.invoiceId}.`,
        });
      }
      invoice.payments.push({
        amount: request.amount,
        method: request.method,
        paidAt: request.paidAt,
      });
      invoice.paidAmount = sumInvoicePayments(invoice.payments);
      invoice.paymentDate = formatDate(request.paidAt);
      invoice.lastUpdated = formatDate(new Date());
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      // A fully-paid Hoá đơn drops off Hôm nay's Quá hạn queue immediately.
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    },
    ...options,
  });
}

export interface SendInvoiceRemindersRequest {
  invoiceIds: string[];
  channel: CommunicationChannel;
}

/** "Gửi nhắc" — đơn lẻ (`invoiceIds` length 1) hoặc hàng loạt từ thanh chọn; ghi nhật ký trên từng Hoá đơn. */
export function useSendInvoiceReminders(
  options?: UseMutationOptionsWrapper<SendInvoiceRemindersRequest, Invoice[]>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SendInvoiceRemindersRequest) => {
      const sentAt = new Date().toISOString();
      const sent: Invoice[] = [];
      for (const invoiceId of request.invoiceIds) {
        const invoice = mockInvoices.find((item) => item.id === invoiceId);
        if (!invoice) continue;
        invoice.reminders.push({ channel: request.channel, sentAt });
        sent.push(invoice);
      }
      return sent;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all }),
    ...options,
  });
}
