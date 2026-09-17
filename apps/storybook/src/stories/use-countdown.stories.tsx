import type { Meta, StoryObj } from "@storybook/react";

import { useCountdown } from "@monorepo/hook/use-countdown";
import { Button } from "@monorepo/ui/components/button";

import { northwindInvoices } from "~/support/invoices";

const invoice = northwindInvoices.find((item) => item.id === "INV-2043");

function Demo() {
  const [timeLeft, reset] = useCountdown(10);

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm">
        Reminder for {invoice?.id} sends in{" "}
        <span className="font-mono text-2xl tabular-nums">{timeLeft}s</span>
      </p>
      <Button variant="outline" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}

const meta = {
  title: "Hooks/useCountdown",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
