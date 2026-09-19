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

  it("shares one markup for both layouts — a sm: flex row over min-width items, a grid below it", () => {
    const { container } = render(
      <KpiStrip
        items={[
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ]}
      />,
    );

    const strip = container.firstElementChild;
    expect(strip).toHaveClass("grid", "grid-cols-2");
    expect(strip).toHaveClass("sm:flex", "sm:overflow-x-auto");
    const [first] = Array.from(strip?.children ?? []);
    expect(first).toHaveClass("sm:min-w-[150px]");
    expect(first).toHaveClass("sm:flex-1");
  });

  it("2×2s a four-item strip on mobile, no tile spanning both columns", () => {
    const { container } = render(
      <KpiStrip
        items={[
          { label: "A", value: 1 },
          { label: "B", value: 2 },
          { label: "C", value: 3 },
          { label: "D", value: 4 },
        ]}
      />,
    );

    const tiles = Array.from(container.firstElementChild?.children ?? []);
    expect(tiles).toHaveLength(4);
    for (const tile of tiles) expect(tile).not.toHaveClass("col-span-2");
  });

  it("spans the third tile full width on mobile when there are only three", () => {
    const { container } = render(
      <KpiStrip
        items={[
          { label: "A", value: 1 },
          { label: "B", value: 2 },
          { label: "C", value: 3 },
        ]}
      />,
    );

    const tiles = Array.from(container.firstElementChild?.children ?? []);
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).not.toHaveClass("col-span-2");
    expect(tiles[1]).not.toHaveClass("col-span-2");
    expect(tiles[2]).toHaveClass("col-span-2", "sm:col-span-1");
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

  it("mirrors KpiStrip's mobile span for a three-tile skeleton", () => {
    const { container } = render(<KpiStripSkeleton count={3} />);

    const tiles = Array.from(container.firstElementChild?.children ?? []);
    expect(tiles[2]).toHaveClass("col-span-2", "sm:col-span-1");
  });
});
