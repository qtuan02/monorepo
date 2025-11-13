import { Skeleton as SkeletonComp } from "@monorepo/ui/shadcn-ui/skeleton";
import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const SkeletonPreview = () => (
  <div className="flex justify-center gap-3">
    <SkeletonComp className="h-12 w-12 rounded-full" />
    <SkeletonComp className="h-12 w-24" />
  </div>
);

const importCode = `
import { Skeleton } from "@monorepo/ui/shadcn-ui/skeleton";
`;

const usageCode = `
<>
  <SkeletonComp className="h-12 w-12 rounded-full" />
  <SkeletonComp className="h-12 w-24" />
</>
`;

const Skeleton = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Skeleton" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <SkeletonPreview />
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

export default Skeleton;
