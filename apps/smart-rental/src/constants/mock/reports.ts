import type { OverdueDebt, ProfitLossSummary, ReportRow } from "~/types/report";

/** The Mock every Báo cáo read comes from (spec #127), generated as the prototype generated it. */
export const mockReportRows: ReportRow[] = [
  // b1 — Trọ Sinh Viên Xanh
  {
    month: "04/2026",
    building: "Trọ Sinh Viên Xanh",
    floor: "Tầng 1",
    revenue: 15000000,
    expenses: 3500000,
    profit: 11500000,
    occupancyRate: 100,
    waterUsage: 80,
    electricityUsage: 450,
    overdueTenants: 0,
    totalTenants: 5,
  },
  {
    month: "04/2026",
    building: "Trọ Sinh Viên Xanh",
    floor: "Tầng 2",
    revenue: 15500000,
    expenses: 3800000,
    profit: 11700000,
    occupancyRate: 80,
    waterUsage: 75,
    electricityUsage: 420,
    overdueTenants: 1,
    totalTenants: 5,
  },
  {
    month: "04/2026",
    building: "Trọ Sinh Viên Xanh",
    floor: "Tầng 3",
    revenue: 16000000,
    expenses: 4000000,
    profit: 12000000,
    occupancyRate: 100,
    waterUsage: 90,
    electricityUsage: 480,
    overdueTenants: 0,
    totalTenants: 5,
  },
  // b2 — Căn hộ Dịch Vụ Cao Cấp
  {
    month: "04/2026",
    building: "Căn hộ Dịch Vụ Cao Cấp",
    floor: "Tầng 2",
    revenue: 25000000,
    expenses: 8000000,
    profit: 17000000,
    occupancyRate: 90,
    waterUsage: 120,
    electricityUsage: 850,
    overdueTenants: 1,
    totalTenants: 5,
  },
  {
    month: "04/2026",
    building: "Căn hộ Dịch Vụ Cao Cấp",
    floor: "Tầng 3",
    revenue: 28000000,
    expenses: 9500000,
    profit: 18500000,
    occupancyRate: 100,
    waterUsage: 140,
    electricityUsage: 920,
    overdueTenants: 0,
    totalTenants: 5,
  },
  // b3 — Chung cư Mini Lê Duẩn
  ...Array.from(
    { length: 15 },
    (_, i): ReportRow => ({
      month: i % 2 === 0 ? "04/2026" : "03/2026",
      building: "Chung cư Mini Lê Duẩn",
      floor: `Tầng ${Math.floor(i / 5) + 1}`,
      revenue: 20000000 + (i % 5) * 1000000,
      expenses: 5000000 + (i % 3) * 500000,
      profit: 15000000 + (i % 4) * 200000,
      occupancyRate: 85 + (i % 15),
      waterUsage: 100 + i * 10,
      electricityUsage: 500 + i * 50,
      overdueTenants: i % 7 === 0 ? 1 : 0,
      totalTenants: 5,
    }),
  ),
];

export const mockOverdueDebts: OverdueDebt[] = Array.from(
  { length: 10 },
  (_, i): OverdueDebt => ({
    id: `OD-${i + 1}`,
    tenant: `Khách hàng ${i + 1}`,
    room: `Phòng ${101 + i}`,
    amount: 2000000 + i * 500000,
    daysOverdue: 5 + i * 5,
    reason: i % 2 === 0 ? "Tiền thuê tháng 04" : "Tiền điện nước chưa đóng",
  }),
);

export const mockProfitLossSummary: ProfitLossSummary = {
  totalRevenue: 545000000,
  totalExpenses: 123000000,
  totalProfit: 422000000,
  avgOccupancy: 94,
};
