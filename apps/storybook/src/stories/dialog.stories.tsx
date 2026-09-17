import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@monorepo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@monorepo/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";

import { currentPerson, hanaSato } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const meta = {
  title: "Storybook/Dialog",
  component: Dialog,
  subcomponents: {
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline">Rename project</Button>}
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Update how {atlas.name} shows up across Northwind.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="project-name">Name</FieldLabel>
              <Input id="project-name" name="name" defaultValue={atlas.name} />
            </Field>
            <Field>
              <FieldLabel htmlFor="project-owner">Owner</FieldLabel>
              <Input
                id="project-owner"
                name="owner"
                defaultValue={currentPerson.name}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  ),
};

export const CloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Share Atlas</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone on Northwind with this link can view {atlas.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue="https://northwind.dev/atlas"
              readOnly
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose render={<Button type="button">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const StickyFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline">Delivery history</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delivery history</DialogTitle>
          <DialogDescription>
            Every notification Northwind has sent about {atlas.name}, oldest
            first. The footer stays visible while the content scrolls.
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={`dialog-history-${index}`} className="mb-4 leading-normal">
              Notification #{index + 1}: {currentPerson.name} updated the{" "}
              {atlas.name} billing schedule and notified the Northwind team.
              Invoice INV-2041 was marked paid the same day.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline">Release notes</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Release notes</DialogTitle>
          <DialogDescription>
            What shipped on {atlas.name} this quarter.
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={`dialog-notes-${index}`} className="mb-4 leading-normal">
              Entry #{index + 1}: the {atlas.name} billing migration moved
              another batch of Northwind invoices onto the new schedule, with no
              downtime reported by {hanaSato.name}'s on-call rotation.
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Delete Atlas</Button>} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This removes {atlas.name} for every Northwind member.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Dialog>
            <DialogTrigger
              render={<Button variant="destructive">Delete</Button>}
            />
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This confirmation opens above the first dialog — a stacking
                  regression would hide it behind the page instead.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  render={
                    <Button variant="destructive">Delete {atlas.name}</Button>
                  }
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
