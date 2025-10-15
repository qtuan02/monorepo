import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Tooltip as TooltipComp,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/shadcn-ui/tooltip";

const TooltipPreview = () => (
  <div className="flex gap-3 justify-center">
    <TooltipComp>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip Content</p>
      </TooltipContent>
    </TooltipComp>
  </div>
);

const importCode = `
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Tooltip as TooltipComp,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/shadcn-ui/tooltip";
`;

const usageCode = `
<TooltipComp>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Tooltip Content</p>
  </TooltipContent>
</TooltipComp>
`;

const Tooltip = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Tooltip" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <TooltipPreview />
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

export default Tooltip;
