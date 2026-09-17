import type { Meta, StoryObj } from "@storybook/react";

import { useBoolean } from "@monorepo/hook/use-boolean";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";

import { northwindInvoices } from "~/support/invoices";

const invoice = northwindInvoices.find((item) => item.id === "INV-2042");

function Demo() {
  const { value: isPaid, toggle, setTrue, setFalse } = useBoolean(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm">
        {invoice?.id}{" "}
        <Badge variant={isPaid ? "default" : "secondary"}>
          {isPaid ? "paid" : "pending"}
        </Badge>
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={toggle}>
          toggle
        </Button>
        <Button variant="outline" onClick={setTrue}>
          Mark paid
        </Button>
        <Button variant="outline" onClick={setFalse}>
          Mark pending
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useBoolean",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
