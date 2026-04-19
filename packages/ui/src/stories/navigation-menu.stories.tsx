import type { Meta, StoryObj } from "@storybook/react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/navigation-menu";

const meta = {
  title: "UI/NavigationMenu",
  component: NavigationMenu,
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithViewport: Story = {
  render: () => (
    <NavigationMenu viewport>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium">Introduction</div>
                  <p className="text-muted-foreground text-xs">
                    Overview of the library.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <div className="text-sm font-medium">Installation</div>
                  <p className="text-muted-foreground text-xs">
                    How to install dependencies.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="h-9 px-4 py-2">
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  ),
};

export const NoViewport: Story = {
  render: () => (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4">
              <p className="text-sm">
                Inline content without separate viewport.
              </p>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
