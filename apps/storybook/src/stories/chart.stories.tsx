import type { Meta, StoryObj } from "@storybook/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@monorepo/ui/components/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@monorepo/ui/components/chart";

import { atlasProject } from "~/support/projects";

const meta = {
  title: "Storybook/Chart",
  component: ChartContainer,
  subcomponents: { ChartTooltip, ChartTooltipContent },
  tags: ["autodocs"],
  parameters: { stage: { width: "lg" } },
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const revenueByMonth = [
  { month: "January", atlas: 1860, beacon: 800 },
  { month: "February", atlas: 3050, beacon: 2000 },
  { month: "March", atlas: 2370, beacon: 1200 },
  { month: "April", atlas: 730, beacon: 1900 },
  { month: "May", atlas: 2090, beacon: 1300 },
  { month: "June", atlas: 2140, beacon: 1400 },
];

const chartConfig = {
  atlas: {
    label: atlasProject.name,
    color: "var(--chart-1)",
  },
  beacon: {
    label: "Beacon",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const Default: Story = {
  // ChartContainer's `config`/`children` are required props with no sensible
  // default, so TypeScript needs `args` even though `render` supplies them.
  args: {} as Story["args"],
  parameters: { controls: { disable: true } },
  render: () => (
    <ChartContainer config={chartConfig} className="w-full">
      <BarChart accessibilityLayer data={revenueByMonth}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="atlas" fill="var(--color-atlas)" radius={4} />
        <Bar dataKey="beacon" fill="var(--color-beacon)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};
