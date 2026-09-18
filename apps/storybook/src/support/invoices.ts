export type NorthwindInvoiceStatus = "paid" | "pending" | "overdue";

export interface NorthwindInvoice {
  id: string;
  projectId: string;
  amount: number;
  status: NorthwindInvoiceStatus;
  issuedOn: string;
}

export const northwindInvoices: NorthwindInvoice[] = [
  {
    id: "INV-2041",
    projectId: "atlas",
    amount: 4200,
    status: "paid",
    issuedOn: "2026-06-01",
  },
  {
    id: "INV-2042",
    projectId: "beacon",
    amount: 1800,
    status: "pending",
    issuedOn: "2026-07-12",
  },
  {
    id: "INV-2043",
    projectId: "comet",
    amount: 3200,
    status: "overdue",
    issuedOn: "2026-05-20",
  },
  {
    id: "INV-2044",
    projectId: "delta",
    amount: 950,
    status: "paid",
    issuedOn: "2026-08-03",
  },
];
