import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-sm">
        Account settings content.
      </TabsContent>
      <TabsContent value="password" className="text-sm">
        Password settings content.
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTrigger: Story = {
  render: () => (
    <Tabs defaultValue="one" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two" disabled>
          Two (disabled)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">Tab one</TabsContent>
    </Tabs>
  ),
};
