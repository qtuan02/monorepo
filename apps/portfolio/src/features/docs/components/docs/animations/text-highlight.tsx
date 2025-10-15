import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { HighlightText as TextHighlightComp } from "@monorepo/ui/animate-ui/text-highlight";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextHighlightPreview = () => (
  <div className="flex justify-center">
    <TextHighlightComp>Text Highlight</TextHighlightComp>
  </div>
);

const importCode = `
import { HighlightText } from "@monorepo/ui/animate-ui/text-highlight";
`;

const usageCode = `
<HighlightText>Text Highlight</HighlightText>
`;

const TextHighlight = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Highlight" slug={slug} locale={locale}>
      <SectionPreviewReload title={t("preview")}>
        <TextHighlightPreview />
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

export default TextHighlight;
