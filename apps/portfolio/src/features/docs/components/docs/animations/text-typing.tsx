import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { TypingText as TextTypingComp } from "@repo/ui/animate-ui/text-typing";
import SectionDocsReload from "../../common/section-docs-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center h-7">
    <TextTypingComp text="Text Typing" />
  </div>
);

const importCode = `
import { TypingText } from "@repo/ui/animate-ui/text-typing";
`;

const usageCode = `
<TextTyping text="Text Typing" />
`;

const TextTyping = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Typing" slug={slug} locale={locale}>
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

export default TextTyping;
