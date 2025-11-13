import { SplittingText as TextSplittingComp } from "@monorepo/ui/animate-ui/text-splitting";
import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center">
    <TextSplittingComp text="Text Splitting" />
  </div>
);

const importCode = `
import { SplittingText } from "@monorepo/ui/animate-ui/text-splitting";
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
