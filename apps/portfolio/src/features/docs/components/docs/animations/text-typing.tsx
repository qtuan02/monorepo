import { TypingText as TextTypingComp } from "@monorepo/ui/animate-ui/text-typing";
import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextTypingPreview = () => (
  <div className="flex h-7 justify-center">
    <TextTypingComp text="Text Typing" />
  </div>
);

const importCode = `
import { TypingText } from "@monorepo/ui/animate-ui/text-typing";
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
        <TextTypingPreview />
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
