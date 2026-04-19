import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Supporting description text.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Main content goes here.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-full max-w-md p-6">
      <p className="text-sm">Simple padded card body.</p>
    </Card>
  ),
};
