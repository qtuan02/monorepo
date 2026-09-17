import type { Meta, StoryObj } from "@storybook/react";
import { EllipsisIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";

import { currentPerson, northwindPeople } from "~/support/people";
import { atlasProject as atlas } from "~/support/projects";

const meta = {
  title: "Storybook/Popover",
  component: Popover,
  subcomponents: {
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverDescription,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Notification settings</Button>}
      />
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="leading-none font-medium">Digest</h4>
            <p className="text-muted-foreground text-sm">
              How often {currentPerson.name} hears about {atlas.name}.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-frequency">Frequency</Label>
              <Input
                id="popover-frequency"
                defaultValue="Daily"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-quiet-start">Quiet from</Label>
              <Input
                id="popover-quiet-start"
                defaultValue="22:00"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="popover-quiet-end">Quiet until</Label>
              <Input
                id="popover-quiet-end"
                defaultValue="08:00"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Form: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Invite teammate</Button>}
      />
      <PopoverContent className="w-72" align="start">
        <PopoverHeader>
          <PopoverTitle>Invite to {atlas.name}</PopoverTitle>
          <PopoverDescription>
            They'll get access as soon as they accept.
          </PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="popover-invite-email" className="w-1/3">
              Email
            </FieldLabel>
            <Input
              id="popover-invite-email"
              placeholder="teammate@northwind.dev"
            />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="popover-invite-role" className="w-1/3">
              Role
            </FieldLabel>
            <Input id="popover-invite-role" defaultValue="Member" />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  ),
};

export const Alignments: Story = {
  render: () => (
    <div className="flex gap-6">
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Start
            </Button>
          }
        />
        <PopoverContent align="start" className="w-40">
          Aligned to start
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              Center
            </Button>
          }
        />
        <PopoverContent align="center" className="w-40">
          Aligned to center
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              End
            </Button>
          }
        />
        <PopoverContent align="end" className="w-40">
          Aligned to end
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Stacking: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline">Assign owner</Button>}
      />
      <PopoverContent className="w-72" align="start">
        <PopoverHeader>
          <PopoverTitle>{atlas.name} owner</PopoverTitle>
        </PopoverHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm">{currentPerson.name}</span>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More options"
                >
                  <EllipsisIcon />
                </Button>
              }
            />
            <PopoverContent className="w-48" align="end">
              <div className="flex flex-col gap-1 text-sm">
                {northwindPeople
                  .filter((person) => person.id !== currentPerson.id)
                  .slice(0, 2)
                  .map((person) => (
                    <span key={person.id}>Transfer to {person.name}</span>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
