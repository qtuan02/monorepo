import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { SplittingText as TextSplittingComp } from "@repo/ui/animate-ui/text-splitting";
import SectionDocsReload from "../../common/section-docs-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center">
    <TextSplittingComp text="Text Splitting" />
  </div>
);

const importCode = `
import { SplittingText } from "@repo/ui/animate-ui/text-splitting";
`;

const usageCode = `
<TextSplitting text="Text Splitting" />
`;

const TextSplitting = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Splitting" slug={slug} locale={locale}>
      <SectionDocsReload title={t("preview")}>
        <TextRollingPreview />
      </SectionDocsReload>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default TextSplitting;
