import type { ChartConfig } from "@monorepo/ui/components/chart";
import {
  Bar,
  BarChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  LabelList,
  XAxis,
  YAxis,
} from "@monorepo/ui/components/chart";

import type { FloorOccupancy } from "~/types/report";

// One navy accent, not the theme's chart palette — this chart states one
// series, so a second colour would encode nothing (round 4 §10 Q16, ADR-0011
// keeps `--chart-*` for the theme; `--primary` is the app's own).
const chartConfig = {
  occupancyRate: { label: "Lấp đầy", color: "var(--primary)" },
} satisfies ChartConfig;

interface FloorOccupancyChartProps {
  data: FloorOccupancy[];
}

/**
 * "Lấp đầy theo tầng" — one bar a floor, sorted highest-first (round 4 §10
 * Q16) since nothing here needs floor order the way a floor list would.
 */
export default function FloorOccupancyChart({
  data,
}: FloorOccupancyChartProps) {
  const rows = [...data]
    .sort((a, b) => b.occupancyRate - a.occupancyRate)
    .map((point) => ({
      floor: `Tầng ${point.floor}`,
      occupancyRate: point.occupancyRate,
    }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-55 w-full"
      aria-label="Biểu đồ lấp đầy theo tầng"
    >
      <BarChart accessibilityLayer data={rows} margin={{ top: 20 }}>
        <XAxis
          dataKey="floor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="occupancyRate"
          fill="var(--color-occupancyRate)"
          radius={[4, 4, 0, 0]}
        >
          <LabelList
            dataKey="occupancyRate"
            position="top"
            fontSize={12}
            formatter={(value) => `${value}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
