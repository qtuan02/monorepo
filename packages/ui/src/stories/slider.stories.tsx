import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "../components/slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
    className: "w-full max-w-md",
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    min: 0,
    max: 100,
  },
};

export const WithSteps: Story = {
  args: {
    defaultValue: [50],
    step: 10,
    min: 0,
    max: 100,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [40],
    disabled: true,
  },
};
