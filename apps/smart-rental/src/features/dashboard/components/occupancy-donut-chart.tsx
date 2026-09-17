import type { ChartConfig } from "@monorepo/ui/components/chart";
import {
  Cell,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Pie,
  PieChart,
} from "@monorepo/ui/components/chart";

import type { DashboardData } from "~/types/dashboard";

const chartConfig = {
  occupied: { label: "Đã thuê", color: "var(--chart-1)" },
  vacant: { label: "Trống", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface OccupancyDonutChartProps {
  occupancy: DashboardData["occupancy"];
}

/** Tỷ lệ lấp đầy — a donut of Phòng đã thuê against Phòng trống. */
export default function OccupancyDonutChart({
  occupancy,
}: OccupancyDonutChartProps) {
  // `name` is the config key, so the tooltip and legend read their labels and
  // colours from one place.
  const data = [
    { name: "occupied", value: occupancy.occupied },
    { name: "vacant", value: occupancy.vacant },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="h-75 w-full"
      aria-label="Biểu đồ tỷ lệ lấp đầy"
    >
      <PieChart accessibilityLayer>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
        >
          {data.map((slice) => (
            <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}
