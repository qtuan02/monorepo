import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Calendar } from "@monorepo/ui/components/calendar";

const meta = {
  title: "Storybook/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// react-day-picker holds no selection of its own — the caller owns it, which is
// why every story here keeps the value in state rather than passing a literal.
export const Default: Story = {
  args: {} as Story["args"],
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(
      new Date(2026, 7, 14),
    );

    return (
      <Calendar
        className="rounded-md border"
        mode="single"
        month={new Date(2026, 7)}
        onSelect={setSelected}
        selected={selected}
      />
    );
  },
};

export const Range: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story: '`mode="range"` selects a start and end day in one calendar.',
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<
      { from: Date | undefined; to?: Date } | undefined
    >({ from: new Date(2026, 7, 10), to: new Date(2026, 7, 16) });

    return (
      <Calendar
        className="rounded-md border"
        mode="range"
        month={new Date(2026, 7)}
        onSelect={setRange}
        selected={range}
      />
    );
  },
};

export const WithDropdowns: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          '`captionLayout="dropdown"` swaps the month label for month and year selects, which is what a date-of-birth picker wants.',
      },
    },
  },
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(
      new Date(2026, 7, 14),
    );

    return (
      <Calendar
        captionLayout="dropdown"
        className="rounded-md border"
        defaultMonth={new Date(2026, 7)}
        endMonth={new Date(2030, 11)}
        mode="single"
        onSelect={setSelected}
        selected={selected}
        startMonth={new Date(1990, 0)}
      />
    );
  },
};

export const Disabled: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          "`disabled` takes a matcher — here every weekend, so the rule lives in one predicate instead of per-day markup.",
      },
    },
  },
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>();

    return (
      <Calendar
        className="rounded-md border"
        disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
        mode="single"
        month={new Date(2026, 7)}
        onSelect={setSelected}
        selected={selected}
      />
    );
  },
};
