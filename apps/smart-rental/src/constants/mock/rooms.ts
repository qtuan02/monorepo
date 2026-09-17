import type { Room } from "~/types/room";

/**
 * The Mock every Phòng read comes from (spec #127), generated exactly as the
 * prototype generated it — 45 Phòng across the first three Toà nhà. Mutable on
 * purpose: the delete-Phòng mutation splices it, as the prototype's repository
 * would have.
 */
export const mockRooms: Room[] = [
  // b1 — Trọ Sinh Viên Xanh
  ...Array.from(
    { length: 15 },
    (_, i): Room => ({
      id: `R-B1-${101 + i}`,
      name: `Phòng ${101 + i}`,
      floor: Math.floor(i / 5) + 1,
      area: 20 + (i % 5),
      price: 2500000 + (i % 3) * 200000,
      status: i % 4 === 0 ? "available" : "occupied",
      type: i % 2 === 0 ? "single" : "double",
      tenant: i % 4 === 0 ? null : `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
      lastUpdated: "20/04/2026",
      buildingId: "b1",
    }),
  ),
  // b2 — Căn hộ Dịch Vụ Cao Cấp
  ...Array.from(
    { length: 10 },
    (_, i): Room => ({
      id: `R-B2-${201 + i}`,
      name: `Phòng ${201 + i}`,
      floor: Math.floor(i / 5) + 2,
      area: 30 + (i % 5) * 5,
      price: 5000000 + (i % 2) * 1000000,
      status: i % 5 === 0 ? "reserved" : "occupied",
      type: "studio",
      tenant: i % 5 === 0 ? null : `Trần Thị ${String.fromCharCode(65 + i)}`,
      lastUpdated: "22/04/2026",
      buildingId: "b2",
    }),
  ),
  // b3 — Chung cư Mini Lê Duẩn
  ...Array.from(
    { length: 20 },
    (_, i): Room => ({
      id: `R-B3-${301 + i}`,
      name: `Phòng ${301 + i}`,
      floor: Math.floor(i / 5) + 3,
      area: 22,
      price: 3500000,
      status: i % 3 === 0 ? "available" : "occupied",
      type: "double",
      tenant: i % 3 === 0 ? null : `Lê Hoàng ${String.fromCharCode(65 + i)}`,
      lastUpdated: "21/04/2026",
      buildingId: "b3",
    }),
  ),
];
