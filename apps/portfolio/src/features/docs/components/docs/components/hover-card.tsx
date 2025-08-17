import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/components/button";
import {
  HoverCard as HoverCardComp,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";

const HoverCardPreview = () => (
  <div className="flex justify-center">
    <HoverCardComp>
      <HoverCardTrigger asChild>
        <Button>Hover Card</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-60">
        <div className="flex justify-between gap-4">Hover Card Content</div>
      </HoverCardContent>
    </HoverCardComp>
  </div>
);

const importCode = `
import { Button } from "@repo/ui/components/button";
import {
  HoverCard as HoverCardComp,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";
`;

const usageCode = `
<HoverCard>
  <HoverCardTrigger asChild>
    <Button>Hover Card</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-60">
    <div className="flex justify-between gap-4">Hover Card Content</div>
  </HoverCardContent>
</HoverCard>
`;

const HoverCard = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hover Card" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <HoverCardPreview />
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

export default HoverCard;
