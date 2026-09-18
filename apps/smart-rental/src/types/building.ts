/** A Toà nhà's per-service unit price (spec #153 §10 row 33 — one Toà nhà, one price). */
export interface PriceList {
  electricityPricePerKwh: number;
  waterPricePerM3: number;
  serviceFee: number;
}

/** Tài khoản nhận tiền — where a Hoá đơn's VietQR points. Optional: a Toà nhà may not have one yet. */
export interface BankAccount {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/** The prototype's `Building`, extended per contract (ADR-0012): id refs stay, `collectionDay` + `priceList` + `bankAccount` are new. */
export interface Building {
  id: string;
  name: string;
  address: string;
  totalFloors?: number;
  /**
   * Ngày thu trong tháng (ADR-0013) — the ONE day a Toà nhà sets. A Hoá đơn
   * of Kỳ `YYYY-MM` falls due this day of the FOLLOWING month; ngày chốt
   * chỉ số is never settable, always the last day of the Kỳ itself.
   */
  collectionDay: number;
  priceList: PriceList;
  /** Absent when the landlord has not declared one yet — no VietQR without it. */
  bankAccount?: BankAccount;
  note?: string;
  imageUrl?: string;
  description?: string;
}

/**
 * What `~/hooks/api/building` actually returns: the Mock entity plus World's
 * computed occupancy figures (ADR-0015 §2) — counted off the Toà nhà's own
 * Phòng and live (`ACTIVE`/`EXPIRING`) Hợp đồng, never a stale stored number.
 */
export type BuildingView = Building & {
  totalRooms: number;
  activeContracts: number;
  availableRooms: number;
  occupancyRate: number;
};

export interface CreateBuildingRequest {
  name: string;
  address: string;
  totalFloors: number;
  collectionDay: number;
  note?: string;
}

/** The Cài đặt tab's own write (spec #153 §10 row 32): ngày thu, Bảng giá, Tài khoản nhận tiền. */
export interface UpdateBuildingSettingsRequest {
  buildingId: string;
  collectionDay: number;
  priceList: PriceList;
  bankAccount?: BankAccount;
}
