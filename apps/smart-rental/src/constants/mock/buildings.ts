import type { Building } from "~/types/building";

/**
 * The Mock every Toà nhà read comes from (spec #127). It lives in the
 * foundation layer rather than the `buildings` slice because `~/hooks/api`
 * serves it and a hook may not import `~/features` (see
 * architecture-circular-dependencies.md). A mutable array on purpose: the
 * create-Toà-nhà mutation writes into it, exactly as the prototype's
 * repository did.
 */
export const mockBuildings: Building[] = [
  {
    id: "b1",
    name: "Trọ Sinh Viên Xanh",
    address: "123 Ngũ Hành Sơn, Đà Nẵng",
    totalRooms: 15,
    activeContracts: 12,
    description: "Khu trọ cao cấp cho sinh viên",
  },
  {
    id: "b2",
    name: "Căn hộ Dịch Vụ Cao Cấp",
    address: "456 Võ Nguyên Giáp, Đà Nẵng",
    totalRooms: 10,
    activeContracts: 8,
    description: "Căn hộ dịch vụ đầy đủ tiện nghi",
  },
  {
    id: "b3",
    name: "Chung cư Mini Lê Duẩn",
    address: "789 Lê Duẩn, Đà Nẵng",
    totalRooms: 20,
    activeContracts: 18,
    description: "Vị trí trung tâm, thuận tiện đi lại",
  },
  {
    id: "b4",
    name: "Ký túc xá Tư nhân Hòa Khánh",
    address: "101 Nguyễn Lương Bằng, Đà Nẵng",
    totalRooms: 50,
    activeContracts: 45,
    description: "Giá rẻ, an ninh tốt cho sinh viên Bách Khoa",
  },
  {
    id: "b5",
    name: "Căn hộ Studio Sơn Trà",
    address: "202 Trần Hưng Đạo, Đà Nẵng",
    totalRooms: 12,
    activeContracts: 10,
    description: "View sông Hàn, thoáng mát",
  },
  {
    id: "b6",
    name: "Nhà nguyên căn Hải Châu",
    address: "303 Phan Châu Trinh, Đà Nẵng",
    totalRooms: 5,
    activeContracts: 5,
    description: "Cho thuê nguyên căn hoặc từng tầng",
  },
  {
    id: "b7",
    name: "Phòng trọ giá rẻ Liên Chiểu",
    address: "404 Âu Cơ, Đà Nẵng",
    totalRooms: 30,
    activeContracts: 25,
    description: "Gần các khu công nghiệp",
  },
  {
    id: "b8",
    name: "Căn hộ Penthouse Luxury",
    address: "505 Bạch Đằng, Đà Nẵng",
    totalRooms: 4,
    activeContracts: 2,
    description: "Đẳng cấp thượng lưu",
  },
  {
    id: "b9",
    name: "Trọ gia đình Cẩm Lệ",
    address: "606 Cách Mạng Tháng 8, Đà Nẵng",
    totalRooms: 8,
    activeContracts: 7,
    description: "Yên tĩnh, phù hợp hộ gia đình",
  },
  {
    id: "b10",
    name: "Homestay Du lịch Ngũ Hành Sơn",
    address: "707 Trường Sa, Đà Nẵng",
    totalRooms: 15,
    activeContracts: 5,
    description: "Kết hợp cho thuê ngắn hạn và dài hạn",
  },
];
