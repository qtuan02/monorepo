import { getTranslations } from "next-intl/server";

import { ScrollProgress as ProgressScrollComp } from "@monorepo/ui/animate-ui/progress-scroll";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const ProgressScrollPreview = () => (
  <div className="relative h-40 overflow-y-auto">
    <ProgressScrollComp
      className="left-0 top-0 z-10 w-full"
      progressProps={{ className: "absolute" }}
    >
      <div className="h-[1000px]">
        <p className="mt-20 text-center">Scroll to see the progress</p>
      </div>
    </ProgressScrollComp>
  </div>
);

const importCode = `
import { ScrollProgress } from "@monorepo/ui/animate-ui/progress-scroll";
`;

const usageCode = `
<div className="relative h-40 overflow-y-auto">
  <ScrollProgress
    className="top-0 left-0 w-full z-10"
    progressProps={{ className: "absolute" }}
  >
    <div className="h-[1000px]">
      <p className="text-center mt-20">Scroll to see the progress</p>
    </div>
  </ScrollProgress>
</div>;
`;

const ProgressScroll = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Progress Scroll" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <ProgressScrollPreview />
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

export default ProgressScroll;
