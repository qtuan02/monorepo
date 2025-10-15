import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";
import InfiniteScrollPreview from "./preview-client/infinite-scroll-preview";

const importCode = `
"use client";

import InfiniteScrollComp from "@monorepo/ui/shadcn-ui/infinite-scroll";
import { Skeleton } from "@monorepo/ui/shadcn-ui/skeleton";
import { useInfiniteScrollQuery } from "~/hooks/use-infinite-scroll";
`;

const usageCode = `
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteScrollQuery();
  
<div className="flex gap-2 max-h-56 overflow-y-auto">
  <div className="flex flex-col gap-y-2 w-full">
    {data?.map((item: any, index: number) => (
      <div
        key={index}
        className="flex flex-col border w-full rounded-lg px-6 py-2"
      >
        <span>{item.title}</span>
        <span>{item.price}</span>
      </div>
    ))}
    <InfiniteScrollComp
      isLoading={isFetchingNextPage}
      hasMore={hasNextPage}
      next={fetchNextPage}
      threshold={0}
    >
      {hasNextPage &&
        Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-full h-10 bg-gray-200 rounded-lg py-8"
          />
        ))}
    </InfiniteScrollComp>
  </div>
</div>
`;

const InfiniteScroll = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="InfiniteScroll" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <InfiniteScrollPreview />
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

export default InfiniteScroll;
