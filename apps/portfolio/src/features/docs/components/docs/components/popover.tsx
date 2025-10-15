import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Popover as PopoverComp,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/shadcn-ui/popover";

const PopoverPreview = () => (
  <div className="flex justify-center">
    <PopoverComp>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div>Popover Content</div>
      </PopoverContent>
    </PopoverComp>
  </div>
);

const importCode = `
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Popover as PopoverComp,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/shadcn-ui/popover";
`;

const usageCode = `
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div>Popover Content</div>
  </PopoverContent>
</Popover>
`;

const Popover = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Popover" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <PopoverPreview />
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

export default Popover;
