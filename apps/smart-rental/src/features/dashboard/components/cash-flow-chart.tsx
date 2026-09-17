import type { ChartConfig } from "@monorepo/ui/components/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
} from "@monorepo/ui/components/chart";

import type { CashFlowPoint } from "~/types/dashboard";

const chartConfig = {
  income: { label: "Tổng thu", color: "var(--chart-1)" },
  expense: { label: "Tổng chi", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface CashFlowChartProps {
  data: CashFlowPoint[];
}

/** Thu vs chi — two bars a month over the last six months. */
export default function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-75 w-full"
      aria-label="Biểu đồ thu chi theo tháng"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
