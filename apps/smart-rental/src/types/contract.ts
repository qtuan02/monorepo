/** The prototype's `Contract`, shape kept 1:1 until `be-motel` has a contract. */
export type ContractStatus = "active" | "ending" | "ended" | "pending";

export interface Contract {
  id: string;
  buildingId?: string;
  contractNumber: string;
  /** Denormalized: the Người thuê's name, not an id (spec #127). */
  tenant: string;
  room: string;
  floor: number;
  rentAmount: number;
  depositAmount: number;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  startDate: string;
  endDate: string;
  status: ContractStatus;
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
