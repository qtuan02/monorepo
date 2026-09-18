import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useDebounce } from "@monorepo/hook/use-debounce";
import { Input } from "@monorepo/ui/components/input";

import { northwindPeople } from "~/support/people";

function Demo() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const matches = northwindPeople.filter((person) =>
    person.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        placeholder="Search Northwind members…"
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="text-muted-foreground text-sm">
        {matches.length} match{matches.length === 1 ? "" : "es"} for "
        {debouncedQuery || "…"}" (debounced 500ms)
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useDebounce",
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
