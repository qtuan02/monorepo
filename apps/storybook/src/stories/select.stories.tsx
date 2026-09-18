import type { Meta, StoryObj } from "@storybook/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import { northwindProjects } from "~/support/projects";

const meta = {
  title: "Storybook/Select",
  component: Select,
  subcomponents: { SelectTrigger, SelectContent, SelectItem },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <Select defaultValue={northwindProjects[0]?.id}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {northwindProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const Sizes: Story = {
  parameters: { stage: { width: "sm" } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "default"] as const).map((size) => (
        <Select key={size} defaultValue={northwindProjects[0]?.id}>
          <SelectTrigger size={size} className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {northwindProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};
