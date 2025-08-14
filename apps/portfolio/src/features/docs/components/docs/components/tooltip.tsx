import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/components/button";
import {
  Tooltip as TooltipComp,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

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
import { Button } from "@repo/ui/components/button";
import {
  Tooltip as TooltipComp,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <TooltipPreview />
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

export default Tooltip;
