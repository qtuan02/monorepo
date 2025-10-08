"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@web/web-ui/shadcn-ui/carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { PopularCard } from "~/components/card/popular-card";

export default function PopularMenu() {
  return (
    <div className="bg-white p-3 h-38 flex flex-col gap-y-2">
      <h3 className="text-lg font-medium text-orange-500">Món phổ biến</h3>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          skipSnaps: true,
        }}
        plugins={[WheelGesturesPlugin({ forceWheelAxis: "x" })]}
        className="size-full"
      >
        <CarouselContent
          wrapperClassName="size-full"
          className="-ml-3 size-full"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="max-w-2xs h-full pl-3">
              <PopularCard
                imageSrc="https://th.bing.com/th/id/OIP.7nAAGu-DUyyMBY8hq-6tVwHaE7?w=263&h=180&c=7&r=0&o=7&cb=12&pid=1.7&rm=3"
                name="Tên món ăn ở phổ biến"
                price={10000000}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
