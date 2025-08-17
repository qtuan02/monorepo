import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { StarsBackground as StarsBackgroundComp } from "@repo/ui/animate-ui/background-start";

const BackgroundStartPreview = () => (
  <div className="relative h-80">
    <StarsBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { StarsBackground } from "@repo/ui/animate-ui/background-start";
`;

const usageCode = `
<StarsBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundStart = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Start" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <BackgroundStartPreview />
      </SectionDocs>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default BackgroundStart;
