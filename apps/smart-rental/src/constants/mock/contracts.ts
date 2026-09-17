import type { Contract } from "~/types/contract";

/**
 * The Mock every Hợp đồng read comes from (spec #127), generated exactly as
 * the prototype generated it — 30 across the first three Toà nhà. Mutable on
 * purpose: create prepends, Gia hạn and Thanh lý rewrite one entry.
 */
export const mockContracts: Contract[] = Array.from(
  { length: 30 },
  (_, i): Contract => ({
    id: `C${String(i + 1).padStart(3, "0")}`,
    contractNumber: `HĐ-${String(i + 1).padStart(3, "0")}`,
    tenant:
      i % 2 === 0
        ? `Nguyễn Văn ${String.fromCharCode(65 + i)}`
        : `Trần Thị ${String.fromCharCode(65 + i)}`,
    room: `Phòng ${101 + (i % 20)}`,
    floor: Math.floor(i / 10) + 1,
    rentAmount: 2500000 + (i % 5) * 500000,
    // One month's rent, as the Người thuê Mock has it; the prototype left the
    // field out and every screen filled a different number in.
    depositAmount: 2500000 + (i % 5) * 500000,
    startDate: "01/01/2024",
    endDate: "01/01/2025",
    status:
      i % 15 === 0
        ? "ended"
        : i % 12 === 0
          ? "ending"
          : i % 10 === 0
            ? "pending"
            : "active",
    lastUpdated: "20/04/2026",
    buildingId: i < 10 ? "b1" : i < 20 ? "b2" : "b3",
  }),
);
