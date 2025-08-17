import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { SpringElement as SpringElementComp } from "@repo/ui/animate-ui/element-spring";

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
import { SpringElement } from "@repo/ui/animate-ui/element-spring";
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
      <SectionDocs title={t("preview")}>
        <ElementSpringPreview />
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

export default ElementSpring;
