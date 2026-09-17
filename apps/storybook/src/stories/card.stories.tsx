import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Field, FieldGroup } from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { Label } from "@monorepo/ui/components/label";

import { atlasProject } from "~/support/projects";

const meta = {
  title: "Storybook/Card",
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "lg" } },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Invite a teammate</CardTitle>
        <CardDescription>Add someone to {atlasProject.name}.</CardDescription>
        <CardAction>
          <Badge>Owner</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="teammate@northwind.dev"
            />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="submit" className="flex-1">
          Send invite
        </Button>
        <Button type="button" variant="outline" className="flex-1">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithCover: Story = {
  render: () => (
    <Card className="pt-0">
      <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
        {atlasProject.name} retro
      </div>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">Featured</Badge>
        </CardAction>
        <CardTitle>{atlasProject.name} retro</CardTitle>
        <CardDescription>
          A look back at the {atlasProject.summary.toLowerCase()}, hosted by the
          Northwind team.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View project</Button>
      </CardFooter>
    </Card>
  ),
};
