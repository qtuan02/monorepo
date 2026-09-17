import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@monorepo/ui/components/accordion";

const meta = {
  title: "Storybook/Accordion",
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  tags: ["autodocs"],
  parameters: { stage: { width: "lg" } },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion defaultValue={["invite"]}>
      <AccordionItem value="invite">
        <AccordionTrigger>How do I invite a teammate?</AccordionTrigger>
        <AccordionContent>
          From the header, open the Northwind menu and choose Invite. They'll
          get an email at their @northwind.dev address with a join link.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="overdue">
        <AccordionTrigger>What happens to an overdue invoice?</AccordionTrigger>
        <AccordionContent>
          An invoice moves to overdue seven days after its due date. The project
          owner gets a notification, and billing can resend it from the invoice
          detail page.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I contact Northwind support?</AccordionTrigger>
        <AccordionContent>
          Email support@northwind.dev or use the in-app chat — we reply within
          one business day.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion multiple defaultValue={["invite", "overdue", "support"]}>
      <AccordionItem value="invite">
        <AccordionTrigger>How do I invite a teammate?</AccordionTrigger>
        <AccordionContent>
          From the header, open the Northwind menu and choose Invite. They'll
          get an email at their @northwind.dev address with a join link.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="overdue">
        <AccordionTrigger>What happens to an overdue invoice?</AccordionTrigger>
        <AccordionContent>
          An invoice moves to overdue seven days after its due date. The project
          owner gets a notification, and billing can resend it from the invoice
          detail page.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I contact Northwind support?</AccordionTrigger>
        <AccordionContent>
          Email support@northwind.dev or use the in-app chat — we reply within
          one business day.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
