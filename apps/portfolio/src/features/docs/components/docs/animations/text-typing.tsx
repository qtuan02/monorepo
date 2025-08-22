import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { TypingText as TextTypingComp } from "@web/ui/animate-ui/text-typing";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center h-7">
    <TextTypingComp text="Text Typing" />
  </div>
);

const importCode = `
import { TypingText } from "@web/ui/animate-ui/text-typing";
`;

const usageCode = `
<TextTyping text="Text Typing" />
`;

const TextTyping = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Typing" slug={slug} locale={locale}>
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

export default TextTyping;
