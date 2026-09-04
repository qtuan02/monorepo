import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  createDataTableColumnHelper,
  DataTable,
  DataTableColumnHeader,
} from "@monorepo/ui/components/data-table";
import { Input } from "@monorepo/ui/components/input";

type Payment = {
  id: string;
  amount: number;
  status: "Chờ xử lý" | "Đang xử lý" | "Thành công" | "Thất bại";
  email: string;
};

const payments: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "Thành công",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "Thành công",
    email: "abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "Đang xử lý",
    email: "monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "Thành công",
    email: "silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "Thất bại",
    email: "carmella@example.com",
  },
  {
    id: "k9x2m1p0",
    amount: 125,
    status: "Chờ xử lý",
    email: "linh.tran@example.com",
  },
  {
    id: "q7w8e9r1",
    amount: 530,
    status: "Thành công",
    email: "minh.le@example.com",
  },
  {
    id: "z2x3c4v5",
    amount: 460,
    status: "Đang xử lý",
    email: "hoa.pham@example.com",
  },
  {
    id: "a1s2d3f4",
    amount: 980,
    status: "Thành công",
    email: "tuan.hoang@example.com",
  },
  {
    id: "g5h6j7k8",
    amount: 214,
    status: "Thất bại",
    email: "an.nguyen@example.com",
  },
  {
    id: "l9p0o1i2",
    amount: 356,
    status: "Chờ xử lý",
    email: "thu.vo@example.com",
  },
  {
    id: "u3y4t5r6",
    amount: 690,
    status: "Thành công",
    email: "duc.dang@example.com",
  },
];

const columnHelper = createDataTableColumnHelper<Payment>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Chọn dòng"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  }),
  columnHelper.accessor("amount", {
    header: () => <div className="text-right">Số tiền</div>,
    cell: ({ getValue }) => (
      <div className="text-right font-medium">
        {getValue().toLocaleString("vi-VN")} ₫
      </div>
    ),
  }),
]);

const meta = {
  title: "Storybook/DataTable",
  component: DataTable,
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// 12 dòng trên pageSize 10 → footer pagination xuất hiện; cột select nuôi dòng
// "Đã chọn x / y". Sort email qua DataTableColumnHeader.
export const Default: Story = {
  args: {} as Story["args"],
  render: () => <DataTable columns={columns} data={payments} />,
};

export const WithToolbar: Story = {
  args: {} as Story["args"],
  parameters: {
    docs: {
      description: {
        story:
          "`toolbar` là render prop nhận table instance — ở đây là một ô filter bám vào column filter của `email`.",
      },
    },
  },
  render: () => (
    <DataTable
      columns={columns}
      data={payments}
      toolbar={(table) => (
        <Input
          className="max-w-sm"
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          placeholder="Lọc theo email…"
          value={
            (table.getColumn("email")?.getFilterValue() as
              | string
              | undefined) ?? ""
          }
        />
      )}
    />
  ),
};

export const Empty: Story = {
  args: {} as Story["args"],
  render: () => (
    <DataTable columns={columns} data={[]} emptyMessage="Chưa có giao dịch." />
  ),
};
