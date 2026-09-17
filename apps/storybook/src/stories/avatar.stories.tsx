import type { Meta, StoryObj } from "@storybook/react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@monorepo/ui/components/avatar";

import { currentPerson, northwindPeople } from "~/support/people";

const meta = {
  title: "Storybook/Avatar",
  component: Avatar,
  subcomponents: {
    AvatarImage,
    AvatarFallback,
    AvatarBadge,
    AvatarGroup,
    AvatarGroupCount,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Every avatar here renders from AvatarFallback's two-letter initials rather
// than a remote image — the workshop has no image host of its own to point at.
export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Avatar>
      <AvatarFallback>{currentPerson.initials}</AvatarFallback>
      <AvatarBadge className="bg-green-600 dark:bg-green-800" />
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>{currentPerson.initials}</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>{currentPerson.initials}</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>{currentPerson.initials}</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {northwindPeople.slice(0, 3).map((person) => (
        <Avatar key={person.id}>
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+{northwindPeople.length - 3}</AvatarGroupCount>
    </AvatarGroup>
  ),
};
