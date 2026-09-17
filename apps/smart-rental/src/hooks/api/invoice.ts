import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Invoice, InvoiceListParams } from "~/types/invoice";
import { mockInvoices } from "~/constants/mock/invoices";
import { queryKeysFactory } from "~/libs/query-key-factory";

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
      mockInvoices.filter(
        (invoice) =>
          !params?.buildingId || invoice.buildingId === params.buildingId,
      ),
    ...options,
  });
}

export function useGetInvoice(
  invoiceId: string,
  options?: UseQueryOptionsWrapper<Invoice | null>,
): UseQueryResult<Invoice | null, Error> {
  return useQuery<Invoice | null, Error>({
    queryKey: invoiceQueryKeys.getInvoice(invoiceId),
    queryFn: async () =>
      mockInvoices.find((invoice) => invoice.id === invoiceId) ?? null,
    ...options,
  });
}
