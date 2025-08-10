import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Badge as BadgeComp } from "@repo/ui/components/badge";

const BadgePreview = () => (
  <div className="flex gap-2">
    <BadgeComp>Default</BadgeComp>
    <BadgeComp variant="secondary">Secondary</BadgeComp>
    <BadgeComp variant="destructive">Destructive</BadgeComp>
    <BadgeComp variant="outline">Outline</BadgeComp>
  </div>
);

const importCode = `
import { Badge } from "@repo/ui/components/badge";
`;

const usageCode = `
<div>
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>
`;

const Badge = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Badge" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 rounded-md p-5">
          <BadgePreview />
        </div>
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

export default Badge;
