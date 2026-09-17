/** The prototype's `Building`, shape kept 1:1 until `be-motel` has a contract. */
export interface Building {
  id: string;
  name: string;
  address: string;
  totalFloors?: number;
  /** Day of the month (1–31) the Chỉ số điện nước are read. */
  utilityCycleDay?: number;
  note?: string;
  imageUrl?: string;
  totalRooms?: number;
  activeContracts?: number;
  availableRooms?: number;
  occupancyRate?: number;
  description?: string;
}
