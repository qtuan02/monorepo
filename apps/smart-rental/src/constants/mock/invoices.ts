import type { BatchInvoiceItem, Invoice } from "~/types/invoice";

/**
 * The Mock every Hoá đơn read comes from (spec #127), generated exactly as the
 * prototype generated it — 30 Hoá đơn, ten per Toà nhà.
 */
export const mockInvoices: Invoice[] = Array.from(
  { length: 30 },
  (_, i): Invoice => ({
    id: `I${String(i + 1).padStart(3, "0")}`,
    invoiceNumber: `HÓA-${String(i + 1).padStart(3, "0")}`,
    tenant:
      i % 2 === 0
        ? `Nguyễn Văn ${String.fromCharCode(65 + i)}`
        : `Trần Thị ${String.fromCharCode(65 + i)}`,
    room: `Phòng ${101 + (i % 20)}`,
    floor: Math.floor(i / 10) + 1,
    amount: 3000000 + (i % 5) * 200000,
    month: "04/2026",
    dueDate: "10/04/2026",
    status:
      i % 5 === 0
        ? "overdue"
        : i % 8 === 0
          ? "cancelled"
          : i % 3 === 0
            ? "pending"
            : "paid",
    paymentDate: i % 3 === 0 ? null : "08/04/2026",
    lastUpdated: "20/04/2026",
    buildingId: i < 10 ? "b1" : i < 20 ? "b2" : "b3",
  }),
);

/** The Phòng an Đợt hoá đơn would bill, as the prototype previewed them. */
export const mockBatchInvoiceItems: BatchInvoiceItem[] = [
  {
    id: "1",
    room: "101",
    tenant: "Nguyễn Văn A",
    rent: 3000000,
    electricity: 350000,
    water: 60000,
    service: 100000,
  },
  {
    id: "2",
    room: "102",
    tenant: "Trần Thị B",
    rent: 3000000,
    electricity: 420000,
    water: 80000,
    service: 100000,
  },
  {
    id: "3",
    room: "103",
    tenant: "Lê Văn C",
    rent: 2500000,
    electricity: 210000,
    water: 40000,
    service: 100000,
  },
];
