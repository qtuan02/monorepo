import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import { northwindInvoices } from "~/support/invoices";
import { currentPerson, northwindPeople } from "~/support/people";
import { atlasProject } from "~/support/projects";

const meta = {
  title: "Storybook/Tabs",
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const atlasInvoiceCount = northwindInvoices.filter(
  (invoice) => invoice.projectId === atlasProject.id,
).length;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>{atlasProject.name}</CardTitle>
            <CardDescription>{atlasProject.summary}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Owned by {currentPerson.name}. The billing migration is 62%
            complete.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="invoices">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Every invoice billed against {atlasProject.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {atlasInvoiceCount} invoice on file, most recently{" "}
            {northwindInvoices[0]?.id}.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>
              Northwind members with access to {atlasProject.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {northwindPeople.length} members, led by {currentPerson.name}.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Orientation: Story = {
  render: () => (
    <Tabs defaultValue="overview" orientation="vertical">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          {atlasProject.summary}, owned by {currentPerson.name}.
        </p>
      </TabsContent>
      <TabsContent value="invoices">
        <p className="text-sm text-muted-foreground">
          {atlasInvoiceCount} invoice billed against {atlasProject.name}.
        </p>
      </TabsContent>
      <TabsContent value="team">
        <p className="text-sm text-muted-foreground">
          {northwindPeople.length} Northwind members have access.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
