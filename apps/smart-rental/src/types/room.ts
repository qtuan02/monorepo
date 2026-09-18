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
  tenant: string | null;
  /** Already display-formatted (`DD/MM/YYYY`) in the prototype's Mock. */
  lastUpdated: string;
}

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
  tenant: string | null;
}

export interface UpdateRoomRequest extends CreateRoomRequest {
  roomId: string;
}
