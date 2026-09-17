import type { Expense } from "~/types/expense";
import { trackMockReset } from "~/utils/mock-reset";

/**
 * The Mock every Chi phí read comes from (spec #127) — the prototype's 13
 * records, without `buildingName`: the hook joins it from the Toà nhà Mock
 * through `resolveBuildingName`.
 */
export const mockExpenses: Omit<Expense, "buildingName">[] = [
  {
    id: "exp-1",
    buildingId: "b1",
    category: "Bảo trì",
    amount: 1200000,
    description: "Thay bóng đèn hành lang tầng 1-3",
    expenseDate: "2024-04-10",
  },
  {
    id: "exp-2",
    buildingId: "b1",
    category: "Vệ sinh",
    amount: 800000,
    description: "Dọn vệ sinh khu chung tháng 4",
    expenseDate: "2024-04-12",
  },
  {
    id: "exp-3",
    buildingId: "b2",
    category: "An ninh",
    amount: 3500000,
    description: "Chi phí bảo vệ ca đêm",
    expenseDate: "2024-04-08",
  },
  {
    id: "exp-4",
    buildingId: "b3",
    category: "Thiết bị",
    amount: 2200000,
    description: "Mua mới 02 bình chữa cháy",
    expenseDate: "2024-04-15",
  },
  {
    id: "exp-5",
    buildingId: "b1",
    category: "Sửa chữa",
    amount: 4500000,
    description: "Sửa hệ thống bơm nước",
    expenseDate: "2024-04-20",
  },
  {
    id: "exp-6",
    buildingId: "b2",
    category: "Khác",
    amount: 950000,
    description: "Văn phòng phẩm và vật tư quản lý",
    expenseDate: "2024-04-22",
  },
  {
    id: "exp-7",
    buildingId: "b1",
    category: "Bảo trì",
    amount: 1500000,
    description: "Sửa vòi nước bồn rửa tay sảnh",
    expenseDate: "2024-04-25",
  },
  {
    id: "exp-8",
    buildingId: "b3",
    category: "An ninh",
    amount: 1200000,
    description: "Nạp thẻ từ thang máy bổ sung",
    expenseDate: "2024-04-26",
  },
  {
    id: "exp-9",
    buildingId: "b2",
    category: "Thiết bị",
    amount: 8500000,
    description: "Lắp đặt 02 camera hành lang tầng 5",
    expenseDate: "2024-04-28",
  },
  {
    id: "exp-10",
    buildingId: "b1",
    category: "Sửa chữa",
    amount: 500000,
    description: "Thay ổ khóa cửa thoát hiểm",
    expenseDate: "2024-04-29",
  },
  {
    id: "exp-11",
    buildingId: "b2",
    category: "Quảng cáo",
    amount: 2000000,
    description: "Chạy quảng cáo Facebook tìm Người thuê",
    expenseDate: "2024-04-30",
  },
  {
    id: "exp-12",
    buildingId: "b1",
    category: "Điện tổng",
    amount: 12500000,
    description: "Thanh toán tiền điện tổng toà nhà tháng 4",
    expenseDate: "2024-05-02",
  },
  {
    id: "exp-13",
    buildingId: "b1",
    category: "Nước tổng",
    amount: 2450000,
    description: "Thanh toán tiền nước tổng tháng 4",
    expenseDate: "2024-05-02",
  },
];

export const resetMockExpenses = trackMockReset(mockExpenses);
