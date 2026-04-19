import type { Meta, StoryObj } from "@storybook/react";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "../components/toggle-group";

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  argTypes: {
    type: { control: "select", options: ["single", "multiple"] },
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    spacing: { control: "number" },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleDefault: Story = {
  args: {} as Story["args"],
  render: () => (
    <ToggleGroup type="single" variant="outline" aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  args: {} as Story["args"],
  render: () => (
    <ToggleGroup type="multiple" variant="outline" aria-label="Formatting">
      <ToggleGroupItem value="bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <ItalicIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Spacing0: Story = {
  args: {} as Story["args"],
  render: () => (
    <ToggleGroup type="single" variant="outline" spacing={0}>
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Spacing4: Story = {
  args: {} as Story["args"],
  render: () => (
    <ToggleGroup type="single" variant="outline" spacing={4}>
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  args: {} as Story["args"],
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="x">sm</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="default">
        <ToggleGroupItem value="x">default</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="lg">
        <ToggleGroupItem value="x">lg</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
