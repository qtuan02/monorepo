import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/components/button";
import {
  Popover as PopoverComp,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";

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
import { Button } from "@repo/ui/components/button";
import {
  Popover as PopoverComp,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <PopoverPreview />
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

export default Popover;
