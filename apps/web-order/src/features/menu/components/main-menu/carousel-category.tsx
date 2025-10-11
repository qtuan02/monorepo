"use client";

import { cn } from "@web/web-ui/libs/cn";
import { Button } from "@web/web-ui/shadcn-ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@web/web-ui/shadcn-ui/carousel";
import WheelGesturesPlugin from "embla-carousel-wheel-gestures";
import * as React from "react";

interface ICarouselCategoryProps {}

const CarouselCategory: React.FC<ICarouselCategoryProps> = (props) => {
  const {} = props;

  const [isActive, setIsActive] = React.useState(0);

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
        containScroll: "keepSnaps",
      }}
      plugins={[WheelGesturesPlugin({ forceWheelAxis: "x" })]}
      className="size-full"
    >
      <CarouselContent wrapperClassName="size-full" className="-ml-0 size-full">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="flex-none h-full pl-0">
            <Button
              variant="ghost"
              className={cn(
                "flex-center px-3 h-full text-base font-medium cursor-pointer rounded-none",
                "hover:bg-transparent hover:border-b-2 hover:border-orange-600 hover:text-orange-500",
                isActive === index &&
                  "border-b-2 border-orange-600 text-orange-500"
              )}
              onClick={() => setIsActive(index)}
            >
              Category {index + 1}
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export { CarouselCategory };
