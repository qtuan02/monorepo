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
  /** Day of the month (1–31) the Chỉ số điện nước are read. */
  utilityCycleDay?: number;
  /** Ngày thu trong tháng — a Hoá đơn's `dueDate` is this day of its billing month. */
  collectionDay: number;
  priceList: PriceList;
  /** Absent when the landlord has not declared one yet — no VietQR without it. */
  bankAccount?: BankAccount;
  note?: string;
  imageUrl?: string;
  totalRooms?: number;
  activeContracts?: number;
  availableRooms?: number;
  occupancyRate?: number;
  description?: string;
}

export interface CreateBuildingRequest {
  name: string;
  address: string;
  totalFloors: number;
  utilityCycleDay: number;
  note?: string;
}
