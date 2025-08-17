import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { FireworksBackground as FireworksBackgroundComp } from "@repo/ui/animate-ui/background-fireworks";

const BackgroundFireworksPreview = () => (
  <div className="relative h-80">
    <FireworksBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { FireworksBackground } from "@repo/ui/animate-ui/background-fireworks";
`;

const usageCode = `
<FireworksBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundFireworks = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Fireworks" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <BackgroundFireworksPreview />
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

export default BackgroundFireworks;
