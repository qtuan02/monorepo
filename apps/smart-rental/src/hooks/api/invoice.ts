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
import type { BatchInvoiceRow } from "~/utils/invoice-batch";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockUtilities } from "~/constants/mock/utilities";
import { reconciliationQueryKeys } from "~/hooks/api/reconciliation";
import { taskQueryKeys } from "~/hooks/api/task";
import { queryKeysFactory } from "~/libs/query-key-factory";
import { formatDate, formatMonth } from "~/utils/date";
import {
  buildBatchInvoiceDueDate,
  buildBatchInvoiceLineItems,
  buildBatchInvoiceRows,
} from "~/utils/invoice-batch";
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
  batchInvoiceRows: (buildingId: string, month: string) =>
    invoiceQueryKeyFactory.list({ kind: "batch-rows", buildingId, month }),
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

/** The Đợt hoá đơn tick table for one Toà nhà + kỳ — `buildBatchInvoiceRows` off the live Mock. */
export function useGetBatchInvoiceRows(
  buildingId: string | null,
  month: string,
  options?: UseQueryOptionsWrapper<BatchInvoiceRow[]>,
): UseQueryResult<BatchInvoiceRow[], Error> {
  return useQuery<BatchInvoiceRow[], Error>({
    queryKey: invoiceQueryKeys.batchInvoiceRows(buildingId ?? "", month),
    queryFn: async () =>
      buildBatchInvoiceRows(
        buildingId ?? "",
        month,
        mockContracts,
        mockUtilities,
        mockInvoices,
      ),
    enabled: !!buildingId,
    ...options,
  });
}

export interface CreateBatchInvoicesRequest {
  buildingId: string;
  /** `YYYY-MM`. */
  month: string;
  /** Ticked rows — only the still-eligible ones among them are actually lập. */
  contractIds: string[];
}

/**
 * "Tạo & Gửi n hoá đơn" — the one write of Đợt hoá đơn (spec #153 §10 row
 * 12): a Hoá đơn per still-eligible Hợp đồng, dòng tiền phòng + điện/nước ×
 * Bảng giá + dịch vụ cố định, hạn thu = ngày thu của Toà nhà. Re-filters
 * against `buildBatchInvoiceRows` at write time too, so a kỳ already lập (or
 * a Chỉ số that went stale) can't be double-billed by a stale tick.
 */
export function useCreateBatchInvoices(
  options?: UseMutationOptionsWrapper<CreateBatchInvoicesRequest, Invoice[]>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBatchInvoicesRequest) => {
      const building = mockBuildings.find((b) => b.id === request.buildingId);
      if (!building) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy toà nhà ${request.buildingId}.`,
        });
      }

      const eligibleRows = buildBatchInvoiceRows(
        request.buildingId,
        request.month,
        mockContracts,
        mockUtilities,
        mockInvoices,
      ).filter(
        (row) => row.eligible && request.contractIds.includes(row.contractId),
      );

      const created: Invoice[] = [];
      for (const row of eligibleRows) {
        const contract = mockContracts.find(
          (item) => item.id === row.contractId,
        );
        if (!contract) continue;

        const lineItems = buildBatchInvoiceLineItems(
          contract,
          building,
          row.electricityConsumption ?? 0,
          row.waterConsumption ?? 0,
        );
        const amount = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const sequence = mockInvoices.length + 1;
        const invoice: Invoice = {
          id: `I${String(sequence).padStart(3, "0")}`,
          buildingId: request.buildingId,
          contractId: contract.id,
          invoiceNumber: `HÓA-${String(sequence).padStart(3, "0")}`,
          tenant: contract.tenant,
          room: contract.room,
          floor: contract.floor,
          amount,
          lineItems,
          payments: [],
          paidAmount: 0,
          reminders: [],
          billingMonth: request.month,
          month: formatMonth(request.month),
          dueDate: buildBatchInvoiceDueDate(building, request.month),
          status: "UNPAID",
          paymentDate: null,
          lastUpdated: formatDate(new Date()),
        };
        mockInvoices.push(invoice);
        created.push(invoice);
      }
      return created;
    },
    onSuccess: () => {
      // A create adds rows to the list (and to the Đợt hoá đơn preview, which
      // is its own `list()` entry) — it touches no existing invoice's detail,
      // so `lists()` is the correctly scoped level (see tanstack-key-factory.md).
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
      // New lineItems change the thu side of Đối soát for this kỳ — mirrors
      // the invalidation expense.ts/supplier-bill.ts already do on their writes.
      queryClient.invalidateQueries({ queryKey: reconciliationQueryKeys.all });
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
