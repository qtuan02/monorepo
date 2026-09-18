/** The prototype's `Room`, shape kept 1:1 until `be-motel` has a contract. */
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";

export type RoomType = "single" | "double" | "studio" | "suite";

export interface Room {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  area: number;
  price: number;
  status: RoomStatus;
  type: RoomType;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  lastUpdated: string;
}

/**
 * What `~/hooks/api/room` actually returns: the Mock entity plus the one
 * World-computed field (ADR-0015 §2) — the name off the Phòng's live
 * (`ACTIVE`/`EXPIRING`) Hợp đồng, `null` once none exists (Thanh lý, or a
 * Phòng that was never occupied).
 */
export type RoomView = Room & { tenant: string | null };

export interface RoomListParams {
  /** The Building scope; `null` or absent means every Toà nhà. */
  buildingId?: string | null;
}

export interface CreateRoomRequest {
  buildingId: string;
  name: string;
  floor: number;
  area: number;
  type: RoomType;
  status: RoomStatus;
  price: number;
}

export interface UpdateRoomRequest extends CreateRoomRequest {
  roomId: string;
}
