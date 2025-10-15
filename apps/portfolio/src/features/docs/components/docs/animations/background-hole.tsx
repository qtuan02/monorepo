import { getTranslations } from "next-intl/server";

import { HoleBackground as HoleBackgroundComp } from "@monorepo/ui/animate-ui/background-hole";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const BackgroundHolePreview = () => (
  <div className="relative h-80">
    <HoleBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { HoleBackground } from "@monorepo/ui/animate-ui/background-hole";
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
