import { getTranslations } from "next-intl/server";

import { HexagonBackground as HexagonBackgroundComp } from "@monorepo/ui/animate-ui/background-hexagon";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const BackgroundHexagonPreview = () => (
  <div className="relative h-80">
    <HexagonBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { HexagonBackground } from "@monorepo/ui/animate-ui/background-hexagon";
`;

const usageCode = `
<HexagonBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundHexagon = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Hexagon" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <BackgroundHexagonPreview />
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

export default BackgroundHexagon;
