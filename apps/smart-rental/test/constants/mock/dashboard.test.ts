import { describe, expect, it } from "vitest";

import {
  getMockDashboard,
  mockDashboard,
  mockDashboardShare,
} from "~/constants/mock/dashboard";

describe("getMockDashboard", () => {
  it("answers `null` — mọi Toà nhà — with the totals as they are", () => {
    expect(getMockDashboard(null)).toBe(mockDashboard);
  });

  it("scales every count and amount by the Toà nhà's share, keeping the rate and the lists", () => {
    const scoped = getMockDashboard("b1");

    expect(scoped.totalRooms).toBe(15);
    expect(scoped.monthlyRevenue).toBe(54_520_000);
    expect(scoped.revenueByMonth[0]?.value).toBe(6.2);
    expect(scoped.cashFlowByMonth[0]).toEqual({
      month: "Tháng 6",
      income: 400,
      expense: 240,
    });
    expect(scoped.occupancy).toEqual({ occupied: 4, vacant: 1 });
    expect(scoped.occupancyRate).toBe(mockDashboard.occupancyRate);
    expect(scoped.pendingTasks).toBe(mockDashboard.pendingTasks);
  });

  it("reads an id the share table does not know as an empty Toà nhà", () => {
    expect(getMockDashboard("khong-ton-tai").totalRooms).toBe(0);
  });

  it("splits the totals exactly — the shares sum to 1", () => {
    const sum = Object.values(mockDashboardShare).reduce((a, b) => a + b, 0);

    expect(sum).toBeCloseTo(1, 10);
  });
});
