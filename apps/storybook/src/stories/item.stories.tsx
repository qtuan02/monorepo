import type { Meta, StoryObj } from "@storybook/react";
import { Fragment } from "react";
import { ChevronRightIcon, FolderIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@monorepo/ui/components/item";

import { northwindNotifications } from "~/support/notifications";
import { northwindPeople } from "~/support/people";
import { atlasProject, northwindProjects } from "~/support/projects";

function personOf(personId: string) {
  return northwindPeople.find((person) => person.id === personId);
}

const meta = {
  title: "Storybook/Item",
  component: Item,
  subcomponents: {
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemGroup,
    ItemSeparator,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Item variant="outline" className="w-full max-w-md">
      <ItemMedia variant="icon">
        <FolderIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{atlasProject.name} billing docs</ItemTitle>
        <ItemDescription>12 files · 3.1 GB</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm">
          <ChevronRightIcon />
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const Group: Story = {
  render: () => (
    <ItemGroup className="w-full max-w-md">
      {northwindNotifications.map((notification, index) => {
        const person = personOf(notification.personId);
        return (
          <Fragment key={notification.id}>
            {index > 0 && <ItemSeparator />}
            <Item>
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>{person?.initials}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{person?.name}</ItemTitle>
                <ItemDescription>{notification.message}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant={notification.read ? "outline" : "secondary"}>
                  {notification.read ? "Read" : "New"}
                </Badge>
              </ItemActions>
            </Item>
          </Fragment>
        );
      })}
    </ItemGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-3">
      {northwindProjects.slice(0, 3).map((project, index) => (
        <Item
          key={project.id}
          variant="outline"
          size={(["default", "sm", "xs"] as const)[index]}
        >
          <ItemContent>
            <ItemTitle>{project.name}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};
