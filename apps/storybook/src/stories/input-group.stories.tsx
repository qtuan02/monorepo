import type { Meta, StoryObj } from "@storybook/react";
import { CopyIcon, FileCodeIcon, GlobeIcon, SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@monorepo/ui/components/input-group";

const meta = {
  title: "Storybook/InputGroup",
  component: InputGroup,
  subcomponents: {
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Search Northwind…" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const BlockStart: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <div className="flex w-full flex-col gap-6">
      <InputGroup className="h-auto">
        <InputGroupInput placeholder="Atlas" />
        <InputGroupAddon align="block-start">
          <InputGroupText>Project name</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea
          placeholder="console.log('Billing migration complete');"
          className="font-mono text-sm"
        />
        <InputGroupAddon align="block-start">
          <FileCodeIcon className="text-muted-foreground" />
          <InputGroupText className="font-mono">migration.js</InputGroupText>
          <InputGroupButton size="icon-xs" className="ml-auto">
            <CopyIcon />
            <span className="sr-only">Copy</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const InlineIcon: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="grid w-full gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Search projects…" />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>northwind.dev/</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="atlas" />
        <InputGroupAddon align="inline-end">
          <GlobeIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
