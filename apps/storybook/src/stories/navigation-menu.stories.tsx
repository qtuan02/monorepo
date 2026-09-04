import type { Meta, StoryObj } from "@storybook/react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@monorepo/ui/components/navigation-menu";

const meta = {
  title: "Storybook/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-2 p-2">
              <li>
                <NavigationMenuLink href="#introduction">
                  Introduction
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#installation">
                  Installation
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#typography">
                  Typography
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-2 p-2">
              <li>
                <NavigationMenuLink href="#dialog">Dialog</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#dropdown-menu">
                  Dropdown Menu
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#tooltip">Tooltip</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
