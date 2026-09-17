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
  subcomponents: { MarkerIcon, MarkerContent },
  tags: ["autodocs"],
} satisfies Meta<typeof Marker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "sm" },
  },
  render: () => (
    <Marker>
      <MarkerIcon>
        <InfoIcon />
      </MarkerIcon>
      <MarkerContent>
        Hana Sato requested a review on Atlas — 2 minutes ago
      </MarkerContent>
    </Marker>
  ),
};

export const Variants: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex w-full flex-col gap-3">
      <Marker>
        <MarkerIcon>
          <InfoIcon />
        </MarkerIcon>
        <MarkerContent>Hana Sato requested a review on Atlas</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>3 new notifications</MarkerContent>
      </Marker>
    </div>
  ),
};
