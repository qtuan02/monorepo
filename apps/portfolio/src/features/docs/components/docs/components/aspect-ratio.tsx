import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { AspectRatio as AspectRatioComp } from "@monorepo/ui/shadcn-ui/aspect-ratio";

import type { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const AspectRatioPreview = () => (
  <AspectRatioComp ratio={16 / 9} className="bg-muted rounded-lg">
    <Image
      src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
      alt="Photo by Drew Beamer"
      fill
      className="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
    />
  </AspectRatioComp>
);

const importCode = `
import { AspectRatio } from "@monorepo/ui/shadcn-ui/aspect-ratio";
`;

const usageCode = `
<AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
  <Image
    src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
    alt="Photo by Drew Beamer"
    fill
    className="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
  />
</AspectRatio>
`;

const AspectRatio = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Aspect Ratio" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <AspectRatioPreview />
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

export default AspectRatio;
