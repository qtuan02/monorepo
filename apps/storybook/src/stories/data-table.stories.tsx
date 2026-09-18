import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
  DataTableContent,
} from "@monorepo/ui/components/data-table";
import { Input } from "@monorepo/ui/components/input";

import type { NorthwindPerson } from "~/support/people";
import { northwindPeople } from "~/support/people";

const columnHelper = createDataTableColumnHelper<NorthwindPerson>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("role", {
    header: "Role",
  }),
]);

const meta = {
  title: "Storybook/DataTable",
  component: DataTable,
  subcomponents: { DataTableColumnHeader, DataTableContent },
  tags: ["autodocs"],
  parameters: { stage: { width: "full" } },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// 8 rows fit on one page, so no pagination footer appears here — WithToolbar
// and Empty below show the other two states.
export const Default: Story = {
  // DataTable's `columns`/`data` are required props with no sensible default,
  // so TypeScript needs `args` even though `render` supplies them itself.
  args: {} as Story["args"],
  parameters: { controls: { disable: true } },
  render: () => (
    <DataTable
      columns={columns}
      data={northwindPeople}
      getRowId={(person) => person.id}
    />
  ),
};

export const WithToolbar: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          "`toolbar` is a render prop over the table instance — here a filter bound to the `name` column's own filter.",
      },
    },
  },
  render: () => (
    <DataTable
      columns={columns}
      data={northwindPeople}
      getRowId={(person) => person.id}
      toolbar={(table) => (
        <Input
          className="max-w-sm"
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          placeholder="Filter by name…"
          value={
            (table.getColumn("name")?.getFilterValue() as string | undefined) ??
            ""
          }
        />
      )}
    />
  ),
};

export const Empty: Story = {
  args: {} as Story["args"],
  render: () => (
    <DataTable columns={columns} data={[]} emptyMessage="No members yet." />
  ),
};
