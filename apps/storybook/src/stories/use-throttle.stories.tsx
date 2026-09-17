import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useThrottle } from "@monorepo/hook/use-throttle";
import { Input } from "@monorepo/ui/components/input";

import { northwindInvoices } from "~/support/invoices";

function Demo() {
  const [query, setQuery] = useState("");
  const throttledQuery = useThrottle(query, 1000);
  const matches = northwindInvoices.filter((invoice) =>
    invoice.id.toLowerCase().includes(throttledQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        placeholder="Search invoices, e.g. INV-2042…"
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="text-muted-foreground text-sm">
        {matches.length} match{matches.length === 1 ? "" : "es"} (throttled to
        once per second)
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useThrottle",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    stage: { width: "sm" },
  },
};
