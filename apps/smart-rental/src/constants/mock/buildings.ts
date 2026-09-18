import type { Building } from "~/types/building";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * The Mock every Toà nhà read comes from (ADR-0012, spec #153): three Toà
 * nhà, 6/8/4 Phòng — down from the prototype's ten, so every screen fits in
 * the one Building scope a landlord actually runs. `b3` deliberately has no
 * `bankAccount` — a Hoá đơn there shows the "chưa khai Tài khoản" warning
 * instead of a VietQR (spec #153 §10 row 26).
 */
export const mockBuildings: Building[] = [
  {
    id: "b1",
    name: "Trọ Sinh Viên Xanh",
    address: "123 Ngũ Hành Sơn, Đà Nẵng",
    totalFloors: 2,
    utilityCycleDay: 28,
    collectionDay: 5,
    priceList: {
      electricityPricePerKwh: 3500,
      waterPricePerM3: 15000,
      serviceFee: 100000,
    },
    bankAccount: {
      bankCode: "VCB",
      bankName: "Vietcombank",
      accountNumber: "0071000123456",
      accountName: "NGUYEN VAN CHU",
    },
    totalRooms: 6,
    // 5/6 Phòng occupied (R-B1-102…106) — kept in step with mock/rooms.ts by
    // hand, same as `tenant` (see that file's own note).
    activeContracts: 5,
    description: "Khu trọ cao cấp cho sinh viên",
  },
  {
    id: "b2",
    name: "Căn hộ Dịch Vụ Cao Cấp",
    address: "456 Võ Nguyên Giáp, Đà Nẵng",
    totalFloors: 4,
    utilityCycleDay: 30,
    collectionDay: 10,
    priceList: {
      electricityPricePerKwh: 3800,
      waterPricePerM3: 18000,
      serviceFee: 150000,
    },
    bankAccount: {
      bankCode: "TCB",
      bankName: "Techcombank",
      accountNumber: "19035551234567",
      accountName: "NGUYEN VAN CHU",
    },
    totalRooms: 8,
    // 6/8 Phòng occupied (203 trống, 204 bảo trì — the other 6 occupied).
    activeContracts: 6,
    description: "Căn hộ dịch vụ đầy đủ tiện nghi",
  },
  {
    id: "b3",
    name: "Chung cư Mini Lê Duẩn",
    address: "789 Lê Duẩn, Đà Nẵng",
    totalFloors: 1,
    utilityCycleDay: 25,
    collectionDay: 1,
    priceList: {
      electricityPricePerKwh: 3500,
      waterPricePerM3: 15000,
      serviceFee: 80000,
    },
    totalRooms: 4,
    // 3/4 Phòng occupied (303 trống).
    activeContracts: 3,
    description: "Vị trí trung tâm, thuận tiện đi lại",
  },
];

/**
 * The one place a `buildingId` becomes a name. The prototype's supplier-bill
 * and expense repositories each faked it as `Toa nha B1`; both joins now read
 * the Mock above (#140).
 */
export function resolveBuildingName(buildingId: string): string {
  return (
    mockBuildings.find((building) => building.id === buildingId)?.name ??
    "Không xác định"
  );
}

/** The join itself: a Mock record without its Toà nhà name, with it. */
export function withBuildingName<T extends { buildingId: string }>(
  record: T,
): T & { buildingName: string } {
  return { ...record, buildingName: resolveBuildingName(record.buildingId) };
}

export const resetMockBuildings = trackMockReset(mockBuildings);
