import type { Tenant } from "~/types/tenant";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * The Mock every Người thuê read comes from (ADR-0012, spec #153) — one per
 * occupied Phòng in `mock/rooms.ts` (14, down from the prototype's 30). No
 * `status` field (ADR-0012 — a Người thuê has none) and no `room`/`floor`/
 * `rentAmount`/`depositAmount`/`moveInDate`/`contractEnd` (ADR-0015 §2 — the
 * matching record in `mock/contracts.ts` is the one source, joined by World).
 */
export const mockTenants: Tenant[] = [
  {
    id: "T001",
    buildingId: "b1",
    name: "Nguyễn Văn A",
    phone: "0905123001",
    email: "vana.nguyen@gmail.com",
    idNumber: "079095001234",
    gender: "male",
  },
  {
    id: "T002",
    buildingId: "b1",
    name: "Trần Thị B",
    phone: "0905123002",
    email: "thib.tran@gmail.com",
    idNumber: "079195002345",
    gender: "female",
  },
  {
    id: "T003",
    buildingId: "b1",
    name: "Lê Văn C",
    phone: "0905123003",
    email: "vanc.le@gmail.com",
    idNumber: "079095003456",
    gender: "male",
  },
  {
    id: "T004",
    buildingId: "b1",
    name: "Phạm Thị D",
    phone: "0905123004",
    email: "thid.pham@gmail.com",
    idNumber: "079195004567",
    gender: "female",
  },
  {
    id: "T005",
    buildingId: "b1",
    name: "Hoàng Văn E",
    phone: "0905123005",
    email: "vane.hoang@gmail.com",
    idNumber: "079095005678",
    gender: "male",
  },
  {
    id: "T006",
    buildingId: "b2",
    name: "Đỗ Thị F",
    phone: "0905123006",
    email: "thif.do@gmail.com",
    idNumber: "079195006789",
    gender: "female",
  },
  {
    id: "T007",
    buildingId: "b2",
    name: "Vũ Văn G",
    phone: "0905123007",
    email: "vang.vu@gmail.com",
    idNumber: "079095007890",
    gender: "male",
  },
  {
    id: "T008",
    buildingId: "b2",
    name: "Bùi Thị H",
    phone: "0905123008",
    email: "thih.bui@gmail.com",
    idNumber: "079195008901",
    gender: "female",
  },
  {
    id: "T009",
    buildingId: "b2",
    name: "Ngô Văn I",
    phone: "0905123009",
    email: "vani.ngo@gmail.com",
    idNumber: "079095009012",
    gender: "male",
  },
  {
    id: "T010",
    buildingId: "b2",
    name: "Dương Thị K",
    phone: "0905123010",
    email: "thik.duong@gmail.com",
    idNumber: "079195010123",
    gender: "female",
  },
  {
    id: "T011",
    buildingId: "b2",
    name: "Lý Văn L",
    phone: "0905123011",
    email: "vanl.ly@gmail.com",
    idNumber: "079095011234",
    gender: "male",
  },
  {
    id: "T012",
    buildingId: "b3",
    name: "Phan Thị M",
    phone: "0905123012",
    email: "thim.phan@gmail.com",
    idNumber: "079195012345",
    gender: "female",
  },
  {
    id: "T013",
    buildingId: "b3",
    name: "Trịnh Văn N",
    phone: "0905123013",
    email: "vann.trinh@gmail.com",
    idNumber: "079095013456",
    gender: "male",
  },
  {
    id: "T014",
    buildingId: "b3",
    name: "Đặng Thị O",
    phone: "0905123014",
    email: "thio.dang@gmail.com",
    idNumber: "079195014567",
    gender: "female",
  },
];

export const resetMockTenants = trackMockReset(mockTenants);
