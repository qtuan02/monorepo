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
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// The pickers are controlled fields — the caller owns the Date and echoes every
// onValueChange back in, which is exactly how an RHF Controller drives them.
export const Default: Story = {
  args: {} as Story["args"],
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14));

    return (
      <div className="w-64">
        <DatePicker
          calendar={{ defaultMonth: new Date(2026, 7) }}
          onValueChange={setDate}
          value={date}
        />
      </div>
    );
  },
};

export const Range: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          "`DateRangePicker` giữ nguyên anatomy nhưng chọn `from – to` trên hai tháng liền nhau — dùng cho filter từ-ngày-đến-ngày.",
      },
    },
  },
  render: () => {
    const [range, setRange] = useState<
      { from: Date | undefined; to?: Date } | undefined
    >({ from: new Date(2026, 7, 10), to: new Date(2026, 7, 16) });

    return (
      <div className="w-80">
        <DateRangePicker
          calendar={{ defaultMonth: new Date(2026, 7) }}
          onValueChange={setRange}
          value={range}
        />
      </div>
    );
  },
};

export const WithInput: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          "`DatePickerInput` là masked input `dd/MM/yyyy` song song với popup calendar: chỉ cần gõ số, dấu `/` tự chèn, ngày không vượt được 31 / tháng không vượt được 12 (số không hợp lệ tự pad-and-shift, vd `35` → `03/05`). Text đủ 10 ký tự đẩy `Date` lên ngay, text dở dang báo `undefined` (để schema required bắt được) và tự lành lại khi blur.",
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14));

    return (
      <div className="w-64">
        <DatePickerInput
          calendar={{ defaultMonth: new Date(2026, 7) }}
          onValueChange={setDate}
          value={date}
        />
      </div>
    );
  },
};

export const WithDropdowns: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          'Truyền cấu hình calendar qua prop `calendar` — `captionLayout: "dropdown"` + `startMonth`/`endMonth` là shape của một date-of-birth picker.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<Date | undefined>();

    return (
      <div className="w-64">
        <DatePicker
          calendar={{
            captionLayout: "dropdown",
            defaultMonth: new Date(2000, 0),
            endMonth: new Date(2026, 11),
            startMonth: new Date(1940, 0),
          }}
          onValueChange={setDate}
          placeholder="Ngày sinh"
          value={date}
        />
      </div>
    );
  },
};
