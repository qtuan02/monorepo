import type { Meta, StoryObj } from "@storybook/react";
import { FolderOpenIcon, SearchIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo/ui/components/empty";
import { Input } from "@monorepo/ui/components/input";

const meta = {
  title: "Storybook/Empty",
  component: Empty,
  subcomponents: {
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Northwind doesn't have any projects yet. Create one to start tracking
          work.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New project</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const NoResults: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No invoices found</EmptyTitle>
        <EmptyDescription>
          Try a different project or clear the status filter.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Input placeholder="Search invoices…" />
      </EmptyContent>
    </Empty>
  ),
};
