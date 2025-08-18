import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { RollingText as TextRollingComp } from "@repo/ui/animate-ui/text-rolling";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextRollingPreview = () => (
  <div className="flex justify-center">
    <TextRollingComp text="Text Rolling" />
  </div>
);

const importCode = `
import { RollingText } from "@repo/ui/animate-ui/text-rolling";
`;

const usageCode = `
<TextRolling text="Text Rolling" />
`;

const TextRolling = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Rolling" slug={slug} locale={locale}>
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

export default TextRolling;
