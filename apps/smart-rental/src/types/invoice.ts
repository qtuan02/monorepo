/** The prototype's `Invoice`, shape kept 1:1 until `be-motel` has a contract. */
export type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  buildingId?: string;
  invoiceNumber: string;
  /** Denormalized: the Người thuê's name, as the prototype kept it. */
  tenant: string;
  room: string;
  floor: number;
  amount: number;
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
}

/** One Phòng in an Đợt hoá đơn preview: the amounts a Hoá đơn would be made of. */
export interface BatchInvoiceItem {
  id: string;
  room: string;
  tenant: string;
  rent: number;
  electricity: number;
  water: number;
  service: number;
}
