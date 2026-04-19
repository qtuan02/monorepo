import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/drawer";

const meta = {
  title: "UI/Drawer",
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Mobile-style panel from Vaul.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Directions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["top", "bottom", "left", "right"] as const).map((dir) => (
        <Drawer key={dir} direction={dir}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              {dir}
            </Button>
          </DrawerTrigger>
          <DrawerContent
            className={dir === "left" || dir === "right" ? "h-full" : undefined}
          >
            <DrawerHeader>
              <DrawerTitle className="capitalize">{dir}</DrawerTitle>
              <DrawerDescription>direction={dir}</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};
