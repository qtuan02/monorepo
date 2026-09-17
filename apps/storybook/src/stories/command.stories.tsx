import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@monorepo/ui/components/command";

import { northwindPeople } from "~/support/people";
import { northwindProjects } from "~/support/projects";

const meta = {
  title: "Storybook/Command",
  component: Command,
  subcomponents: {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Command>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    stage: { width: "sm" },
    controls: { disable: true },
  },
  render: () => (
    <Command className="rounded-lg border">
      <CommandInput placeholder="Search Northwind..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {northwindProjects.map((project) => (
            <CommandItem key={project.id}>
              <FolderIcon />
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="People">
          {northwindPeople.slice(0, 3).map((person) => (
            <CommandItem key={person.id}>
              <UserIcon />
              <span>{person.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>
            <UserPlusIcon />
            <span>Invite teammate</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <PlusIcon />
            <span>New project</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Stacking: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="w-full">
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Northwind workspace — Atlas billing migration overview.
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setOpen(true)}
        >
          Open command palette (⌘K)
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search Northwind..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Projects">
              {northwindProjects.map((project) => (
                <CommandItem key={project.id}>
                  <FolderIcon />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
};
