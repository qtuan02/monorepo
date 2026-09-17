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
  /** ISO date. */
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
 * `month` / `dueDate` / `tenant` / `room` / `floor` stay — old screens keep
 * reading them unchanged.
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
  /** Already display-formatted (`MM/YYYY`). */
  month: string;
  /** Already display-formatted (`DD/MM/YYYY`). */
  dueDate: string;
  status: InvoiceStatus;
  paymentDate: string | null;
  lastUpdated: string;
}

export interface InvoiceListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
  /** Scope to one Hợp đồng's own Hoá đơn — its detail screen's "Hoá đơn" tab. */
  contractId?: string;
}
