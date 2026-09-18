import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";

import { useOnScreen } from "@monorepo/hook/use-on-screen";
import { Badge } from "@monorepo/ui/components/badge";

import { northwindInvoices } from "~/support/invoices";

const invoice = northwindInvoices.find((item) => item.id === "INV-2044");

function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <div className="flex flex-col gap-3">
      <Badge variant={isVisible ? "default" : "secondary"}>
        {invoice?.id} {isVisible ? "on screen" : "off screen"}
      </Badge>
      <div className="h-48 overflow-y-auto rounded-md border p-4">
        <p className="text-muted-foreground text-sm">Scroll down</p>
        <div className="h-64" />
        <div
          ref={ref}
          className="bg-primary text-primary-foreground rounded-md p-4 text-sm"
        >
          {invoice?.id}
        </div>
        <div className="h-32" />
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useOnScreen",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
