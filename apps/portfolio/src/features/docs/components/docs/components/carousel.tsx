import { getTranslations } from "next-intl/server";

import {
  Carousel as CarouselComp,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@monorepo/ui/shadcn-ui/carousel";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const CarouselPreview = () => (
  <CarouselComp className="max-w-3xs mx-auto w-full md:max-w-xs">
    <CarouselContent>
      {Array.from({ length: 5 }).map((_, index) => (
        <CarouselItem key={index}>
          <div className="p-1">
            <div className="size-full rounded-md border shadow-inherit">
              <div className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </div>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </CarouselComp>
);

const importCode = `
import {
  Carousel as CarouselComp,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@monorepo/ui/shadcn-ui/carousel";
`;

const usageCode = `
<Carousel className="w-full max-w-3xs md:max-w-xs mx-auto">
  <CarouselContent>
    {Array.from({ length: 5 }).map((_, index) => (
      <CarouselItem key={index}>
        <div className="p-1">
          <div className="size-full border shadow-inherit rounded-md">
            <div className="flex aspect-square items-center justify-center p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </div>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
`;

const Carousel = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Carousel" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <CarouselPreview />
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

export default Carousel;
