/** Enum per `contract-service` contract (ADR-0012). */
export type ContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRING"
  | "EXPIRED"
  | "TERMINATED";

/** Enum per `contract-service` contract (`deposit_status`). */
export type DepositStatus =
  | "HELD"
  | "RETURNED"
  | "PARTIAL_RETURNED"
  | "FORFEITED";

/** One Gia hạn: the end date and rent before → after. */
export interface ContractRenewalRecord {
  /** ISO timestamp. */
  renewedAt: string;
  previousEndDate: string;
  newEndDate: string;
  previousRentAmount: number;
  newRentAmount: number;
}

/**
 * The prototype's `Contract`, extended per contract (ADR-0012): `roomId` /
 * `tenantId` are the real references now, `tenant` / `room` / `floor` stay as
 * the join a hook (or, here, the Mock's own authoring) already resolved — old
 * screens keep reading them unchanged.
 */
export interface Contract {
  id: string;
  buildingId: string;
  roomId: string;
  tenantId: string;
  contractNumber: string;
  /** Denormalized: the Người thuê's name, not an id (spec #127). */
  tenant: string;
  room: string;
  floor: number;
  rentAmount: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  /** > 0 only once some of the cọc has actually been handed back. */
  depositReturnedAmount: number;
  /** Ngày trong tháng tiền thuê đến hạn; mirrors the Toà nhà's `collectionDay`. */
  paymentDueDay: number;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  startDate: string;
  endDate: string;
  status: ContractStatus;
  renewalHistory: ContractRenewalRecord[];
  /** Set only once Thanh lý has run. */
  terminatedAt?: string;
  terminationReason?: string;
  lastUpdated: string;
}

export interface ContractListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export interface CreateContractRequest {
  buildingId: string;
  roomId: string;
  tenantName: string;
  tenantPhone: string;
  tenantIdCard: string;
  /** ISO `YYYY-MM-DD`, as `<input type="date">` hands it over. */
  startDate: string;
  termMonths: number;
  rentAmount: number;
  depositAmount: number;
}

export interface RenewContractRequest {
  contractId: string;
  /** ISO `YYYY-MM-DD`. */
  newEndDate: string;
  newRentAmount: number;
  notes?: string;
}
