import type { DashboardData } from "~/types/dashboard";

/**
 * The Mock behind `/` (spec #127, ticket #142). The prototype had no `data/`
 * for the dashboard — its numbers sat as literals inside the page — so this is
 * those literals, moved, and nothing aggregated from another slice. The one
 * change: the revenue series was `Math.random()` per render; it is fixed
 * here so a test can name a bar.
 */
export const mockDashboard: DashboardData = {
  totalRooms: 145,
  occupancyRate: 94.2,
  monthlyRevenue: 545_200_000,
  operatingCost: 123_500_000,
  revenueByMonth: [
    { month: "Thg 1", value: 62 },
    { month: "Thg 2", value: 58 },
    { month: "Thg 3", value: 71 },
    { month: "Thg 4", value: 84 },
    { month: "Thg 5", value: 77 },
    { month: "Thg 6", value: 69 },
    { month: "Thg 7", value: 92 },
    { month: "Thg 8", value: 88 },
    { month: "Thg 9", value: 74 },
    { month: "Thg 10", value: 81 },
    { month: "Thg 11", value: 95 },
    { month: "Thg 12", value: 90 },
  ],
  cashFlowByMonth: [
    { month: "Tháng 6", income: 4000, expense: 2400 },
    { month: "Tháng 7", income: 3000, expense: 1398 },
    { month: "Tháng 8", income: 2000, expense: 9800 },
    { month: "Tháng 9", income: 2780, expense: 3908 },
    { month: "Tháng 10", income: 1890, expense: 4800 },
    { month: "Tháng 11", income: 2390, expense: 3800 },
  ],
  occupancy: { occupied: 42, vacant: 6 },
  pendingTasks: [
    {
      id: 1,
      title: "Sửa vòi nước phòng 108",
      type: "Bảo trì",
      priority: "Cao",
      due: "Hôm nay",
    },
    {
      id: 2,
      title: "Phòng 302 - Lê Thị C sắp hết hạn hợp đồng",
      type: "Hợp đồng",
      priority: "Vừa",
      due: "Trong 3 ngày",
    },
    {
      id: 3,
      title: "Hóa đơn phòng 204 quá hạn",
      type: "Hóa đơn",
      priority: "Khẩn cấp",
      due: "Quá hạn 2 ngày",
    },
  ],
  recentActivities: [
    {
      id: 1,
      action: "Khách thuê mới",
      detail: "Trần Văn B đã ký hợp đồng phòng 201",
      time: "2 giờ trước",
    },
    {
      id: 2,
      action: "Thanh toán",
      detail: "Phòng 105 đã thanh toán hóa đơn tháng 4",
      time: "3 giờ trước",
    },
    {
      id: 3,
      action: "Phòng trống",
      detail: "Phòng 405 đã trả phòng, sẵn sàng cho thuê",
      time: "1 ngày trước",
    },
  ],
};

/**
 * Each Toà nhà's share of the totals above, keyed by the `mockBuildings` id —
 * ten numbers summing to 1, so a Building scope reads as a slice of the same
 * figures rather than a second hand-written dashboard per Toà nhà. Kept here
 * by value: the dashboard Mock never reads another entity's Mock.
 */
export const mockDashboardShare: Record<string, number> = {
  b1: 0.1,
  b2: 0.07,
  b3: 0.14,
  b4: 0.34,
  b5: 0.06,
  b6: 0.05,
  b7: 0.08,
  b8: 0.04,
  b9: 0.05,
  b10: 0.07,
};

function scale(value: number, share: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * share * factor) / factor;
}

/**
 * The dashboard for a Building scope: `null` is "mọi Toà nhà" — the totals as
 * they are. A Toà nhà gets every count and amount scaled by its share; the
 * rate, the tasks and the activities stay, because a share of a percentage or
 * of a sentence means nothing. An id the share table does not know reads as
 * an empty Toà nhà.
 */
export function getMockDashboard(buildingId: string | null): DashboardData {
  if (buildingId === null) return mockDashboard;

  const share = mockDashboardShare[buildingId] ?? 0;

  return {
    ...mockDashboard,
    totalRooms: scale(mockDashboard.totalRooms, share),
    monthlyRevenue: scale(mockDashboard.monthlyRevenue, share),
    operatingCost: scale(mockDashboard.operatingCost, share),
    revenueByMonth: mockDashboard.revenueByMonth.map((point) => ({
      ...point,
      value: scale(point.value, share, 1),
    })),
    cashFlowByMonth: mockDashboard.cashFlowByMonth.map((point) => ({
      ...point,
      income: scale(point.income, share),
      expense: scale(point.expense, share),
    })),
    occupancy: {
      occupied: scale(mockDashboard.occupancy.occupied, share),
      vacant: scale(mockDashboard.occupancy.vacant, share),
    },
  };
}
