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

import type { MonthlyPoint } from "~/types/dashboard";

// The app's own navy, not the theme's chart palette — one series states
// nothing extra by a second colour (round 4 §10 Q16, ADR-0011).
const chartConfig = {
  value: { label: "Doanh thu", color: "var(--primary)" },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: MonthlyPoint[];
}

/** Doanh thu theo tháng — one bar a month, in triệu VND, labelled directly. */
export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-55 w-full"
      aria-label="Biểu đồ doanh thu theo tháng"
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
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
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="value"
            position="top"
            fontSize={12}
            formatter={(value) => `${value}tr`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
