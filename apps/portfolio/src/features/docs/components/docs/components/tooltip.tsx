import { getTranslations } from "next-intl/server";

import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Tooltip as TooltipComp,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/shadcn-ui/tooltip";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const TooltipPreview = () => (
  <div className="flex justify-center gap-3">
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
