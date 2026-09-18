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

import type { MonthlyPoint } from "~/types/dashboard";

const chartConfig = {
  value: { label: "Doanh thu", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: MonthlyPoint[];
}

/** Doanh thu theo tháng — one bar a month, in triệu VND. */
export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-55 w-full"
      aria-label="Biểu đồ doanh thu theo tháng"
    >
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="month"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}tr`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
