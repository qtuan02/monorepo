import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import SortablePreview from "./preview-client/sortable-preview";

const importCode = `
"use client";
import { useState } from "react";
import * as Sortable from "@monorepo/ui/shadcn-ui/sortable";
`;

const usageCode = `
const [data, setData] = useState([  
  {
    id: "1",
    title: "Item 1",
    description: "Item 1 description",
  }, {/* ... */}
]);

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
`;

const Sortable = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Sortable" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <SortablePreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default Sortable;
