import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  HoverCard as HoverCardComp,
  HoverCardContent,
  HoverCardTrigger,
} from "@monorepo/ui/shadcn-ui/hover-card";

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
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  HoverCard as HoverCardComp,
  HoverCardContent,
  HoverCardTrigger,
} from "@monorepo/ui/shadcn-ui/hover-card";
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
      <SectionPreview title={t("preview")}>
        <HoverCardPreview />
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

export default HoverCard;
