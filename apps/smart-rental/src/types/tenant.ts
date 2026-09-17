/** The prototype's `Tenant`, shape kept 1:1 until `be-motel` has a contract. */
export type TenantStatus = "active" | "pending" | "overdue" | "ended";

export type TenantGender = "male" | "female";

export interface Tenant {
  id: string;
  buildingId?: string;
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
  status: TenantStatus;
  idNumber: string;
  gender: TenantGender;
  /** A Tailwind `bg-*` class the avatar tile wears. */
  avatarColor: string;
}

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
