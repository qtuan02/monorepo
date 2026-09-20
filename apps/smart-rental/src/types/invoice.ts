import type { CommunicationChannel } from "~/types/communication";

/** Enum per `billing-service` contract (ADR-0012). */
export type InvoiceStatus =
  | "DRAFT"
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type InvoiceLineItemType =
  | "RENT"
  | "ELECTRIC"
  | "WATER"
  | "SERVICE"
  | "EXTRA"
  | "DISCOUNT";

export interface InvoiceLineItem {
  type: InvoiceLineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoicePaymentMethod = "BANK_TRANSFER" | "CASH" | "VIETQR";

export interface InvoicePayment {
  amount: number;
  method: InvoicePaymentMethod;
  /** ISO `YYYY-MM-DD`. */
  paidAt: string;
}

/** One "Gửi nhắc" — logged on the Hoá đơn itself, never a separate Mock. */
export interface InvoiceReminder {
  channel: CommunicationChannel;
  /** ISO timestamp. */
  sentAt: string;
}

/**
 * The prototype's `Invoice`, extended per contract (ADR-0012): `contractId`
 * is the real reference, `lineItems` + `payments` are new, `paidAmount` is
 * derived from `payments` (see `~/utils/invoice-payments`). `amount` /
 * `dueDate` / `tenant` / `room` / `floor` stay — old screens keep reading
 * them unchanged. There is no pre-rendered `month` string any more — every
 * screen derives it with `formatMonth(billingMonth)`.
 */
export interface Invoice {
  id: string;
  buildingId?: string;
  contractId: string;
  invoiceNumber: string;
  /** Denormalized: the Người thuê's name, as the prototype kept it. */
  tenant: string;
  room: string;
  floor: number;
  /** The invoice total — rent + utilities + service + extra − discount. */
  amount: number;
  lineItems: InvoiceLineItem[];
  payments: InvoicePayment[];
  /** Derived from `payments` — see `sumInvoicePayments`. */
  paidAmount: number;
  reminders: InvoiceReminder[];
  /** `YYYY-MM`. */
  billingMonth: string;
  /** ISO `YYYY-MM-DD`. */
  dueDate: string;
  status: InvoiceStatus;
  /** ISO `YYYY-MM-DD`. */
  paymentDate: string | null;
  /** ISO `YYYY-MM-DD`. */
  lastUpdated: string;
}

export interface InvoiceListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
  /** Scope to one Hợp đồng's own Hoá đơn — its detail screen's "Hoá đơn" tab. */
  contractId?: string;
}
