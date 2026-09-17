import type { Meta, StoryObj } from "@storybook/react";
import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
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
} from "@monorepo/ui/components/context-menu";

import { currentPerson, northwindPeople } from "~/support/people";
import { atlasProject } from "~/support/projects";

const meta = {
  title: "Storybook/ContextMenu",
  component: ContextMenu,
  subcomponents: {
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuLabel,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const owners = northwindPeople.slice(0, 3);

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        <span className="hidden pointer-fine:inline-block">
          Right-click the {atlasProject.name} card
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long-press the {atlasProject.name} card
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuItem>
            Open project
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Rename
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>Archive</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Copy link</ContextMenuItem>
              <ContextMenuItem>Email invite</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuCheckboxItem defaultChecked>
            Show on dashboard
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Pin to sidebar</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuRadioGroup value={currentPerson.id}>
            <ContextMenuLabel>Owner</ContextMenuLabel>
            {owners.map((person) => (
              <ContextMenuRadioItem key={person.id} value={person.id}>
                {person.name}
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem variant="destructive">
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const Icons: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        <span className="hidden pointer-fine:inline-block">
          Right-click an invoice row
        </span>
        <span className="hidden pointer-coarse:inline-block">
          Long-press an invoice row
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem>
            <CopyIcon />
            Copy invoice ID
          </ContextMenuItem>
          <ContextMenuItem>
            <PencilIcon />
            Edit invoice
          </ContextMenuItem>
          <ContextMenuItem>
            <ShareIcon />
            Share
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem variant="destructive">
            <TrashIcon />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
