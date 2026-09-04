import type { Meta, StoryObj } from "@storybook/react";
import { InfoIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@monorepo/ui/components/marker";

const meta = {
  title: "Storybook/Marker",
  component: Marker,
  tags: ["autodocs"],
} satisfies Meta<typeof Marker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Marker className="max-w-sm">
      <MarkerIcon>
        <InfoIcon />
      </MarkerIcon>
      <MarkerContent>Read 2 minutes ago</MarkerContent>
    </Marker>
  ),
};

export const Separator: Story = {
  args: {},
  render: () => (
    <Marker variant="separator" className="max-w-sm">
      <MarkerContent>Today</MarkerContent>
    </Marker>
  ),
};

export const Border: Story = {
  args: {},
  render: () => (
    <Marker variant="border" className="max-w-sm">
      <MarkerContent>New messages</MarkerContent>
    </Marker>
  ),
};
