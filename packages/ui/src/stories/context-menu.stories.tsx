import type { Meta, StoryObj } from "@storybook/react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../components/context-menu";

const meta = {
  title: "UI/ContextMenu",
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="bg-muted flex h-32 w-full max-w-md items-center justify-center rounded-md border text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Forward
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxAndRadio: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="bg-muted flex h-32 w-full max-w-md items-center justify-center rounded-md border text-sm">
        Right click
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuCheckboxItem checked>Show books</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="a">
          <ContextMenuRadioItem value="a">Sort by name</ContextMenuRadioItem>
          <ContextMenuRadioItem value="b">Sort by date</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="bg-muted flex h-32 w-full max-w-md items-center justify-center rounded-md border text-sm">
        Right click
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Mail</ContextMenuItem>
            <ContextMenuItem>Copy link</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
