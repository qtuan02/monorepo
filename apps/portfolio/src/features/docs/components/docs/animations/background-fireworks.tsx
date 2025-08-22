import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { FireworksBackground as FireworksBackgroundComp } from "@web/ui/animate-ui/background-fireworks";

const BackgroundFireworksPreview = () => (
  <div className="relative h-80">
    <FireworksBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { FireworksBackground } from "@web/ui/animate-ui/background-fireworks";
`;

const usageCode = `
<FireworksBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundFireworks = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Fireworks" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <BackgroundFireworksPreview />
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

export default BackgroundFireworks;
