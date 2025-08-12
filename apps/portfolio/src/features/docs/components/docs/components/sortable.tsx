import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import SortablePreview from "./preview-client/sortable-preview";

const importCode = `
"use client";
import { useState } from "react";
import * as Sortable from "@repo/ui/components/sortable";
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
        <div className="flex size-full flex-col gap-1 rounded-md border bg-zinc-100 p-4 text-foreground shadow-sm dark:bg-zinc-900">
          <div className="font-medium text-sm leading-tight sm:text-base">
            {item.title}
          </div>
          <span className="line-clamp-2 hidden text-muted-foreground text-sm sm:inline-block">
            {item.description}
          </span>
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <SortablePreview />
        </div>
      </SectionDocs>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default Sortable;
