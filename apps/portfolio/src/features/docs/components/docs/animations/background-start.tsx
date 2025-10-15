import { getTranslations } from "next-intl/server";

import { StarsBackground as StarsBackgroundComp } from "@monorepo/ui/animate-ui/background-start";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const BackgroundStartPreview = () => (
  <div className="relative h-80 bg-black/50">
    <StarsBackgroundComp className="absolute inset-0 flex items-center justify-center rounded-xl" />
  </div>
);

const importCode = `
import { StarsBackground } from "@monorepo/ui/animate-ui/background-start";
`;

const usageCode = `
<StarsBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
`;

const BackgroundStart = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Background Start" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <BackgroundStartPreview />
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

export default BackgroundStart;
