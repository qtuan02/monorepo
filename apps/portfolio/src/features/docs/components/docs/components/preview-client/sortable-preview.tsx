"use client";

import { useState } from "react";
import * as SortableComp from "@monorepo/ui/shadcn-ui/sortable";
import { GripVertical } from "lucide-react";

const SortablePreview = () => {
  const [data, setData] = useState([
    {
      id: "1",
      title: "Item 1",
      description: "Item 1 description",
    },
    {
      id: "2",
      title: "Item 2",
      description: "Item 2 description",
    },
    {
      id: "3",
      title: "Item 3",
      description: "Item 3 description",
    },
    {
      id: "4",
      title: "Item 4",
      description: "Item 4 description",
    },
    {
      id: "5",
      title: "Item 5",
      description: "Item 5 description",
    },
    {
      id: "6",
      title: "Item 6",
      description: "Item 6 description",
    },
    {
      id: "7",
      title: "Item 7",
      description: "Item 7 description",
    },
    {
      id: "8",
      title: "Item 8",
      description: "Item 8 description",
    },
    {
      id: "9",
      title: "Item 9",
      description: "Item 9 description",
    },
  ]);

  return (
    <SortableComp.Root
      value={data}
      onValueChange={setData}
      getItemValue={(item) => item.id}
      orientation="mixed"
    >
      <SortableComp.Content className="grid auto-rows-fr grid-cols-3 gap-2.5">
        {data.map((item) => (
          <SortableComp.Item key={item.id} value={item.id} asChild asHandle>
            <div className="flex items-center gap-x-2 size-full rounded-md border shadow-sm bg-zinc-100 dark:bg-zinc-900 px-2 py-2 md:py-4">
              <GripVertical className="size-3 md:size-6" />
              <div className="flex flex-col gap-1 text-foreground">
                <div className="font-medium text-sm leading-tight md:text-base">
                  {item.title}
                </div>
                <span className="line-clamp-2 hidden text-muted-foreground text-sm md:inline-block">
                  {item.description}
                </span>
              </div>
            </div>
          </SortableComp.Item>
        ))}
      </SortableComp.Content>
      <SortableComp.Overlay>
        <div className="size-full rounded-md bg-primary/5" />
      </SortableComp.Overlay>
    </SortableComp.Root>
  );
};

export default SortablePreview;
