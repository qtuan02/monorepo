import type { Meta, StoryObj } from "@storybook/react";

import { Card, CardContent } from "@monorepo/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@monorepo/ui/components/carousel";

import { northwindProjects } from "~/support/projects";

const meta = {
  title: "Storybook/Carousel",
  component: Carousel,
  subcomponents: {
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "full" } },
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Carousel>
      <CarouselContent>
        {northwindProjects.map((project) => (
          <CarouselItem key={project.id}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square flex-col items-center justify-center gap-1 p-6 text-center">
                  <span className="text-lg font-semibold">{project.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {project.summary}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
