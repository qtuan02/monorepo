import type { Meta, StoryObj } from "@storybook/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@monorepo/ui/components/alert-dialog";
import { Button } from "@monorepo/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@monorepo/ui/components/drawer";

import { currentPerson } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const meta = {
  title: "Storybook/Drawer",
  component: Drawer,
  subcomponents: {
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Drawer>
      <DrawerTrigger
        render={<Button variant="outline">Delivery history</Button>}
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{atlas.name} deliveries</DrawerTitle>
          <DrawerDescription>
            Every notification Northwind has sent about this project.
          </DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={`drawer-history-${index}`} className="mb-4 leading-normal">
              Notification #{index + 1}: {currentPerson.name} updated the{" "}
              {atlas.name} billing schedule and notified the Northwind team.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <Button>Mark all as read</Button>
          <DrawerClose render={<Button variant="outline">Close</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger
        render={<Button variant="outline">Project settings</Button>}
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{atlas.name} settings</DrawerTitle>
          <DrawerDescription>
            Danger zone actions stay at the bottom of this drawer.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive">Delete project</Button>}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {atlas.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This confirmation opens above the drawer — a stacking
                  regression would hide it behind the panel instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
