import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: {} as Story["args"],
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="one">
        <AccordionTrigger>First item</AccordionTrigger>
        <AccordionContent>Content for the first section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second item</AccordionTrigger>
        <AccordionContent>Content for the second section.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {} as Story["args"],
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="a">
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>Details A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>Details B</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
