import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Calendar } from "../components/calendar";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: function SingleCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    );
  },
};

export const CaptionLabel: Story = {
  render: function CaptionLabelCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="label"
        className="rounded-md border"
      />
    );
  },
};

export const CaptionDropdown: Story = {
  render: function CaptionDropdownCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        className="rounded-md border"
      />
    );
  },
};

export const OutsideDaysHidden: Story = {
  render: function OutsideDays() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showOutsideDays={false}
        className="rounded-md border"
      />
    );
  },
};

export const ButtonVariants: Story = {
  render: function ButtonVar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-muted-foreground mb-2 text-xs">
            buttonVariant: ghost (default)
          </p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            buttonVariant="ghost"
            className="rounded-md border"
          />
        </div>
        <div>
          <p className="text-muted-foreground mb-2 text-xs">
            buttonVariant: outline
          </p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            buttonVariant="outline"
            className="rounded-md border"
          />
        </div>
      </div>
    );
  },
};
