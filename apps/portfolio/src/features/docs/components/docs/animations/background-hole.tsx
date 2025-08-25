import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { HoleBackground as HoleBackgroundComp } from "@web/web-ui/animate-ui/background-hole";

const BackgroundHolePreview = () => (
  <div className="relative h-80">
    <HoleBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { HoleBackground } from "@web/web-ui/animate-ui/background-hole";
`;

const usageCode = `
<HoleBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundHole = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Hole" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <BackgroundHolePreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default BackgroundHole;
