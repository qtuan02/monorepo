import type { Meta, StoryObj } from "@storybook/react";
import { BotIcon, ChevronDownIcon, PlusIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@monorepo/ui/components/button-group";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@monorepo/ui/components/popover";
import { Textarea } from "@monorepo/ui/components/textarea";

const meta = {
  title: "Storybook/ButtonGroup",
  component: ButtonGroup,
  subcomponents: { ButtonGroupText, ButtonGroupSeparator },
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <ButtonGroup>
      <ButtonGroupText render={<Label htmlFor="project-name">Name</Label>} />
      <Input placeholder="Atlas" id="project-name" />
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <Button variant="outline" size="sm">
          Rename
        </Button>
        <Button variant="outline" size="sm">
          Archive
        </Button>
        <Button variant="outline" size="icon-sm">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Rename</Button>
        <Button variant="outline">Archive</Button>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="lg">
          Rename
        </Button>
        <Button variant="outline" size="lg">
          Archive
        </Button>
        <Button variant="outline" size="icon-lg">
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const Orientation: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Rename</Button>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Delete</Button>
    </ButtonGroup>
  ),
};

export const Copilot: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon /> Copilot
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Open Copilot">
              <ChevronDownIcon />
            </Button>
          }
        />
        <PopoverContent align="end" className="rounded-xl text-sm">
          <PopoverHeader>
            <PopoverTitle>Start a new task with Copilot</PopoverTitle>
          </PopoverHeader>
          <Field>
            <FieldLabel htmlFor="copilot-task" className="sr-only">
              Task description
            </FieldLabel>
            <Textarea
              id="copilot-task"
              placeholder="Rename Atlas to Atlas Billing…"
              className="resize-none"
            />
            <FieldDescription>
              Copilot will open a pull request for review.
            </FieldDescription>
          </Field>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  ),
};
