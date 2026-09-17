import type { Meta, StoryObj } from "@storybook/react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import { northwindInvoices } from "~/support/invoices";
import { northwindProjects } from "~/support/projects";

function projectName(projectId: string) {
  return (
    northwindProjects.find((project) => project.id === projectId)?.name ??
    projectId
  );
}

const meta = {
  title: "Storybook/Table",
  component: Table,
  subcomponents: {
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "full" } },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableCaption>Northwind's recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Invoice</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {northwindInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{projectName(invoice.projectId)}</TableCell>
            <TableCell className="capitalize">{invoice.status}</TableCell>
            <TableCell className="text-right">
              ${invoice.amount.toLocaleString("en-US")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            $
            {northwindInvoices
              .reduce((sum, invoice) => sum + invoice.amount, 0)
              .toLocaleString("en-US")}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

/**
 * The filled header a data screen opens with. `@monorepo/ui`'s `TableHeader` is
 * the pristine registry component — it has no `variant` prop — so the fill is
 * utility classes at the call site. Sticky positioning stays here too: only the
 * caller knows which element scrolls.
 */
export const PrimaryHeader: Story = {
  render: () => (
    <Table>
      <TableHeader className="bg-primary [&_th]:text-primary-foreground [&_tr]:border-b-0 [&_tr]:hover:bg-primary">
        <TableRow>
          <TableHead className="w-24">Invoice</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {northwindInvoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{projectName(invoice.projectId)}</TableCell>
            <TableCell className="capitalize">{invoice.status}</TableCell>
            <TableCell className="text-right">
              ${invoice.amount.toLocaleString("en-US")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
