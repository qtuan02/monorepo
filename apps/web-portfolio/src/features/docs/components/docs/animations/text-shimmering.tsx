import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { ShimmeringText as TextShimmeringComp } from "@web/web-ui/animate-ui/text-shimmering";
import SectionPreviewReload from "../../common/section-preview-reload";

const TextShimmeringPreview = () => (
  <div className="flex justify-center">
    <TextShimmeringComp text="Text Shimmering" wave />
  </div>
);

const importCode = `
import { ShimmeringText } from "@web/web-ui/animate-ui/text-shimmering";
`;

const usageCode = `
<ShimmeringText text="Text Shimmering" wave />
`;

const TextShimmering = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Text Shimmering" slug={slug} locale={locale}>
      <SectionPreviewReload title={t("preview")}>
        <TextShimmeringPreview />
      </SectionPreviewReload>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default TextShimmering;
