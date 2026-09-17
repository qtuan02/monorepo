import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  DatePicker,
  DatePickerInput,
  DateRangePicker,
} from "@monorepo/ui/components/date-picker";

const meta = {
  title: "Storybook/DatePicker",
  component: DatePicker,
  subcomponents: { DatePickerInput, DateRangePicker },
  tags: ["autodocs"],
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// The pickers are controlled fields — the caller owns the Date and echoes every
// onValueChange back in, which is exactly how an RHF Controller drives them.
export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14));

    return (
      <DatePicker
        calendar={{ defaultMonth: new Date(2026, 7) }}
        onValueChange={setDate}
        value={date}
      />
    );
  },
};

export const Range: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DateRangePicker` keeps the same anatomy but picks `from – to` across two adjoining months — the shape a from/to filter wants.",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<
      { from: Date | undefined; to?: Date } | undefined
    >({ from: new Date(2026, 7, 10), to: new Date(2026, 7, 16) });

    return (
      <DateRangePicker
        calendar={{ defaultMonth: new Date(2026, 7) }}
        onValueChange={setRange}
        value={range}
      />
    );
  },
};

export const WithInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DatePickerInput` is a `dd/MM/yyyy` masked input alongside the popup calendar: type digits only, the `/` separators fill in automatically, the day never exceeds 31 and the month never 12 (an impossible digit pads and shifts, e.g. `35` → `03/05`). A complete 10-character text pushes the `Date` up immediately; an incomplete one reports `undefined` (so a required schema catches it) and self-heals on blur.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14));

    return (
      <DatePickerInput
        calendar={{ defaultMonth: new Date(2026, 7) }}
        onValueChange={setDate}
        value={date}
      />
    );
  },
};

export const WithDropdowns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass calendar config through the `calendar` prop — `captionLayout: "dropdown"` plus `startMonth`/`endMonth` is the shape of a date-of-birth picker.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <DatePicker
        calendar={{
          captionLayout: "dropdown",
          defaultMonth: new Date(2000, 0),
          endMonth: new Date(2026, 11),
          startMonth: new Date(1940, 0),
        }}
        onValueChange={setDate}
        placeholder="Date of birth"
        value={date}
      />
    );
  },
};
