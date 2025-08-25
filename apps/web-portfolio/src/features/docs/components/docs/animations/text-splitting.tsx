import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { SplittingText as TextSplittingComp } from "@web/web-ui/animate-ui/text-splitting";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center">
    <TextSplittingComp text="Text Splitting" />
  </div>
);

const importCode = `
import { SplittingText } from "@web/web-ui/animate-ui/text-splitting";
`;

const usageCode = `
<TextSplitting text="Text Splitting" />
`;

const TextSplitting = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Splitting" slug={slug} locale={locale}>
      <SectionPreviewReload title={t("preview")}>
        <TextRollingPreview />
      </SectionPreviewReload>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default TextSplitting;
