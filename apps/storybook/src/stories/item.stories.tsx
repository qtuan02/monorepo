import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRightIcon, FolderIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@monorepo/ui/components/item";

const meta = {
  title: "Storybook/Item",
  component: Item,
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Item variant="outline" className="w-full max-w-md">
      <ItemMedia variant="icon">
        <FolderIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Design assets</ItemTitle>
        <ItemDescription>128 files · 2.4 GB</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm">
          <ChevronRightIcon />
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const Group: Story = {
  args: {},
  render: () => (
    <ItemGroup className="w-full max-w-md">
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>shadcn</ItemTitle>
          <ItemDescription>Merged pull request #124</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary">2h ago</Badge>
        </ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarFallback>NM</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Nguyễn Minh</ItemTitle>
          <ItemDescription>Commented on issue #98</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary">1d ago</Badge>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Item variant="outline" size="default">
        <ItemContent>
          <ItemTitle>Default size</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Small size</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline" size="xs">
        <ItemContent>
          <ItemTitle>Extra small size</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
};
