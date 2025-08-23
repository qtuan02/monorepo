import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { Skeleton as SkeletonComp } from "@web/ui/shadcn-ui/skeleton";

const SkeletonPreview = () => (
  <div className="flex gap-3 justify-center">
    <SkeletonComp className="h-12 w-12 rounded-full" />
    <SkeletonComp className="h-12 w-24" />
  </div>
);

const importCode = `
import { Skeleton } from "@web/ui/shadcn-ui/skeleton";
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
