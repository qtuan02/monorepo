import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Skeleton as SkeletonComp } from "@repo/ui/components/skeleton";

const SkeletonPreview = () => (
  <div className="flex gap-3 justify-center">
    <SkeletonComp className="h-12 w-12 rounded-full" />
    <SkeletonComp className="h-12 w-24" />
  </div>
);

const importCode = `
import { Skeleton } from "@repo/ui/components/skeleton";
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <SkeletonPreview />
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

export default Skeleton;
