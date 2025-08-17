import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { HighlightText as TextHighlightComp } from "@repo/ui/animate-ui/text-highlight";
import SectionDocsReload from "../../common/section-docs-reload";

const TextHighlightPreview = () => (
  <div className="flex justify-center">
    <TextHighlightComp>Text Highlight</TextHighlightComp>
  </div>
);

const importCode = `
import { HighlightText } from "@repo/ui/animate-ui/text-highlight";
`;

const usageCode = `
<HighlightText>Text Highlight</HighlightText>
`;

const TextHighlight = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Highlight" slug={slug} locale={locale}>
      <SectionDocsReload title={t("preview")}>
        <TextHighlightPreview />
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

export default TextHighlight;
