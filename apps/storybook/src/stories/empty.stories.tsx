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
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No files found</EmptyTitle>
        <EmptyDescription>
          You haven't uploaded any files yet. Get started by uploading one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Upload file</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const SearchResults: Story = {
  args: {},
  render: () => (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search to find what you're looking for.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Input placeholder="Search..." className="max-w-xs" />
      </EmptyContent>
    </Empty>
  ),
};
