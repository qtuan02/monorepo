import { getTranslations } from "next-intl/server";

import { Badge as BadgeComp } from "@monorepo/ui/shadcn-ui/badge";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const BadgePreview = () => (
  <div className="flex gap-2">
    <BadgeComp>Default</BadgeComp>
    <BadgeComp variant="secondary">Secondary</BadgeComp>
    <BadgeComp variant="destructive">Destructive</BadgeComp>
    <BadgeComp variant="outline">Outline</BadgeComp>
  </div>
);

const importCode = `
import { Badge } from "@monorepo/ui/shadcn-ui/badge";
`;

const usageCode = `
<div className="flex gap-2">
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
      <SectionPreview title={t("preview")}>
        <BadgePreview />
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

export default Badge;
