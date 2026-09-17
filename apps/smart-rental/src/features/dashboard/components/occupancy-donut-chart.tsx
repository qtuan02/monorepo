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

import type { OccupancySummary } from "~/types/dashboard";

const chartConfig = {
  occupied: { label: "Đã thuê", color: "var(--chart-1)" },
  vacant: { label: "Trống", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface OccupancyDonutChartProps {
  occupancy: OccupancySummary;
}

/** Tỷ lệ lấp đầy — a donut of Phòng đã thuê against Phòng trống, and which ones are trống. */
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
    <div className="space-y-2">
      <ChartContainer
        config={chartConfig}
        className="h-55 w-full"
        aria-label="Biểu đồ tỷ lệ lấp đầy"
      >
        <PieChart accessibilityLayer>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          {/* `nameKey` here too — omitting it falls back to the Pie's own
              `dataKey` ("value") for every slice's legend key, so both
              entries collide on "value" (React's duplicate-key console
              warning at "/", research C.1 #19). */}
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
      {occupancy.vacant > 0 && (
        <p className="text-muted-foreground text-center text-xs">
          Trống · {occupancy.vacantRoomNames.join(", ")}
        </p>
      )}
    </div>
  );
}
