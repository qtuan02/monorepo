/**
 * A Người thuê has no stored status (ADR-0012, spec #153 §10) — "Đang thuê" /
 * "Đã rời" is derived from its Hợp đồng (see `~/utils/tenant-status`). Kept
 * here as the shape the hook attaches for every screen (see `TenantView`).
 */
export type TenantStatus = "active" | "ended";

export type TenantGender = "male" | "female";

/** The prototype's `Tenant`, minus `status` (ADR-0012) — a Người thuê has none. */
export interface Tenant {
  id: string;
  buildingId: string;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  gender: TenantGender;
}

/**
 * What `~/hooks/api/tenant` actually returns: the Mock entity plus World's
 * computed fields (ADR-0015 §2) — `room`/`floor`/`rentAmount`/
 * `depositAmount`/`moveInDate`/`contractEnd` off the tenant's live
 * (`ACTIVE`/`EXPIRING`) Hợp đồng, falling back to its most recently ended one
 * once none is live, and the "chờ vào" blanks (`"—"`/`0`) once it has never
 * had one; plus `status` and `hasOverdueInvoice` (ADR-0012).
 */
export type TenantView = Tenant & {
  /** Denormalized: the Phòng's display name, not its id (spec #127). */
  room: string;
  floor: number;
  rentAmount: number;
  depositAmount: number;
  /** Already display-formatted (`DD/MM/YYYY`). */
  moveInDate: string;
  contractEnd: string;
  status: TenantStatus;
  hasOverdueInvoice: boolean;
};

export interface TenantListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export interface CreateTenantRequest {
  /** The Building scope at the time of creating, so the new Người thuê shows in it. */
  buildingId?: string;
  fullName: string;
  idCard: string;
  /** ISO `YYYY-MM-DD`, as `<input type="date">` hands it over. */
  dob: string;
  hometown: string;
  phone: string;
  email: string;
  vehicleType?: string;
  vehiclePlate?: string;
}
