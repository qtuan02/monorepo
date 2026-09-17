/**
 * A Người thuê has no stored status (ADR-0012, spec #153 §10) — "Đang thuê" /
 * "Đã rời" is derived from its Hợp đồng, a later ticket's job. Kept here only
 * as the shape a hook temporarily attaches for old screens (see `TenantView`).
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
  /** Denormalized: the Phòng's display name, not its id (spec #127). */
  room: string;
  floor: number;
  rentAmount: number;
  depositAmount: number;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  moveInDate: string;
  contractEnd: string;
  idNumber: string;
  gender: TenantGender;
}

/**
 * What `~/hooks/api/tenant` actually returns: the Mock entity plus a
 * temporary, hook-computed `status` so screens built for it keep rendering
 * (ADR-0012 punts the real derivation — from an active Hợp đồng plus an
 * overdue-Hoá-đơn flag — to a later ticket).
 */
export type TenantView = Tenant & { status: TenantStatus };

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
