import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { RollingText as TextRollingComp } from "@repo/ui/animate-ui/text-rolling";
import SectionDocsReload from "../../common/section-docs-reload";

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

export default TextRolling;
