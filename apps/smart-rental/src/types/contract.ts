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

/** The three ways a Thanh lý can settle Cọc — `HELD` only describes it before Thanh lý runs. */
export type LiquidationDecision = Exclude<DepositStatus, "HELD">;

/** One Gia hạn: the end date and rent before → after. */
export interface ContractRenewalRecord {
  /** ISO timestamp. */
  renewedAt: string;
  /** ISO `YYYY-MM-DD`. */
  previousEndDate: string;
  newEndDate: string;
  previousRentAmount: number;
  newRentAmount: number;
  notes?: string;
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
  /** "Thời hạn báo trước" trước khi hết hạn, ngày — mặc định 30, không enforce phạt (spec #153). */
  noticeDays: number;
  /** ISO `YYYY-MM-DD`. */
  startDate: string;
  endDate: string;
  status: ContractStatus;
  renewalHistory: ContractRenewalRecord[];
  /** ISO `YYYY-MM-DD`; set only once Thanh lý has run. */
  terminatedAt?: string;
  /** The Thanh lý's lý do — required only when `depositStatus` is `PARTIAL_RETURNED`. */
  terminationReason?: string;
  /** ISO `YYYY-MM-DD`. */
  lastUpdated: string;
}

export interface ContractListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export interface CreateContractRequest {
  roomId: string;
  tenantId: string;
  /** ISO `YYYY-MM-DD`, as `DateField` hands it over. */
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  noticeDays: number;
}

export interface RenewContractRequest {
  contractId: string;
  /** ISO `YYYY-MM-DD`. */
  newEndDate: string;
  newRentAmount: number;
  notes?: string;
}

export interface LiquidateContractRequest {
  contractId: string;
  decision: LiquidationDecision;
  /** What the Người thuê actually gets back, already netted against nợ thật. */
  returnedAmount: number;
  /** Required only for `PARTIAL_RETURNED` — see `~/features/contracts/types/liquidation-form`. */
  reason?: string;
}
