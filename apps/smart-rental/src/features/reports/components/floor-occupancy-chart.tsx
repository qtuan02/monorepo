import type { ChartConfig } from "@monorepo/ui/components/chart";
import {
  Bar,
  BarChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
} from "@monorepo/ui/components/chart";

import type { FloorOccupancy } from "~/types/report";

const chartConfig = {
  occupancyRate: { label: "Lấp đầy", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface FloorOccupancyChartProps {
  data: FloorOccupancy[];
}

/** "Lấp đầy theo tầng" — one bar a floor (spec #153 §10 row 29). */
export default function FloorOccupancyChart({
  data,
}: FloorOccupancyChartProps) {
  const rows = data.map((point) => ({
    floor: `Tầng ${point.floor}`,
    occupancyRate: point.occupancyRate,
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-55 w-full"
      aria-label="Biểu đồ lấp đầy theo tầng"
    >
      <BarChart accessibilityLayer data={rows}>
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
        />
      </BarChart>
    </ChartContainer>
  );
}
