import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../components/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../components/command";

const meta = {
  title: "UI/CommandDialog",
  component: CommandDialog,
} satisfies Meta<typeof CommandDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: function CommandDialogDemo() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => setOpen(false)}>
                New file
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                Settings
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              <CommandItem onSelect={() => setOpen(false)}>
                Project A
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};
