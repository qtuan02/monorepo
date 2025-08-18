import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { ScrollProgress as ProgressScrollComp } from "@repo/ui/animate-ui/progress-scroll";

const ProgressScrollPreview = () => (
  <div className="relative h-40 overflow-y-auto">
    <ProgressScrollComp
      className="top-0 left-0 w-full z-10"
      progressProps={{ className: "absolute" }}
    >
      <div className="h-[1000px]">
        <p className="text-center mt-20">Scroll to see the progress</p>
      </div>
    </ProgressScrollComp>
  </div>
);

const importCode = `
import { ScrollProgress } from "@repo/ui/animate-ui/progress-scroll";
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
