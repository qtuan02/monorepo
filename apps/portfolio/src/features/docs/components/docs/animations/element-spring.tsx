import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { SpringElement as SpringElementComp } from "@monorepo/ui/animate-ui/element-spring";

const ElementSpringPreview = () => (
  <div className="relative h-40">
    <SpringElementComp className="absolute inset-0 flex items-center justify-center rounded-xl">
      <div className="size-20 bg-orange-500 rounded-full flex-center">
        Drag me
      </div>
    </SpringElementComp>
  </div>
);

const importCode = `
import { SpringElement } from "@monorepo/ui/animate-ui/element-spring";
`;

const usageCode = `
<SpringElement className="absolute inset-0 flex items-center justify-center rounded-xl">
  <div className="size-10 bg-orange-500 rounded-full flex-center">Drag me</div>
</SpringElement>;
`;

const ElementSpring = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Element Spring" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <ElementSpringPreview />
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

export default ElementSpring;
