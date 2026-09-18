import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiStrip, KpiStripSkeleton } from "~/components/card/kpi-strip";

describe("KpiStrip", () => {
  it("renders every item's label, value, description and trend", () => {
    render(
      <KpiStrip
        items={[
          { label: "Đã thu", value: "412.000.000 ₫" },
          {
            label: "Tổng số phòng",
            value: 48,
            description: "trên toàn bộ toà nhà",
            trend: { value: 8, isPositive: true },
          },
          {
            label: "Chi phí",
            value: "10tr",
            trend: { value: "-4%", isPositive: false },
          },
        ]}
      />,
    );

    expect(screen.getByText("Đã thu")).toBeInTheDocument();
    expect(screen.getByText("412.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.getByText("trên toàn bộ toà nhà")).toBeInTheDocument();
    expect(screen.getByText("▲ 8%")).toBeInTheDocument();
    expect(screen.getByText("▼ -4%")).toBeInTheDocument();
  });

  it("shares one markup for both sizes — a horizontal-scroll container over min-width items", () => {
    const { container } = render(
      <KpiStrip
        items={[
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ]}
      />,
    );

    const strip = container.firstElementChild;
    expect(strip).toHaveClass("overflow-x-auto");
    const [first] = Array.from(strip?.children ?? []);
    expect(first).toHaveClass("min-w-[150px]");
    expect(first).toHaveClass("flex-1");
  });
});

describe("KpiStripSkeleton", () => {
  it("renders the requested tile count, capped by the same footprint", () => {
    const { container } = render(<KpiStripSkeleton count={3} />);

    const strip = container.firstElementChild;
    expect(strip?.children).toHaveLength(3);
  });

  it("defaults to four tiles", () => {
    const { container } = render(<KpiStripSkeleton />);

    expect(container.firstElementChild?.children).toHaveLength(4);
  });
});
