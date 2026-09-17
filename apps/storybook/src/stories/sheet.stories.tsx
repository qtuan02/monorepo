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
import { Field, FieldGroup } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monorepo/ui/components/sheet";

import { currentPerson } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const meta = {
  title: "Storybook/Sheet",
  component: Sheet,
  subcomponents: {
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Edit project</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit project</SheetTitle>
          <SheetDescription>
            Update {atlas.name}'s details. Save when you're done.
          </SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <Label htmlFor="sheet-project-name">Name</Label>
            <Input id="sheet-project-name" defaultValue={atlas.name} />
          </Field>
          <Field>
            <Label htmlFor="sheet-project-owner">Owner</Label>
            <Input id="sheet-project-owner" defaultValue={currentPerson.name} />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

const sheetSides = ["top", "right", "bottom", "left"] as const;

export const Side: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {sheetSides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger
            render={
              <Button variant="outline" className="capitalize">
                {side}
              </Button>
            }
          />
          <SheetContent
            side={side}
            className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
          >
            <SheetHeader>
              <SheetTitle>Delivery history</SheetTitle>
              <SheetDescription>
                Every notification Northwind has sent about {atlas.name}.
              </SheetDescription>
            </SheetHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <p
                  key={`sheet-history-${index}`}
                  className="mb-4 leading-normal"
                >
                  Notification #{index + 1}: {currentPerson.name} updated the{" "}
                  {atlas.name} billing schedule and notified the Northwind team.
                </p>
              ))}
            </div>
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose render={<Button variant="outline">Cancel</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline">Project settings</Button>}
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{atlas.name} settings</SheetTitle>
          <SheetDescription>
            Danger zone actions stay at the bottom of this sheet.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive">Delete project</Button>}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {atlas.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This confirmation opens above the sheet — a stacking
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
