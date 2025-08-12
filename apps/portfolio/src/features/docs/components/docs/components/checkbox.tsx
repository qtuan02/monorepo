import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Checkbox as CheckboxComp } from "@repo/ui/components/checkbox";

const CheckboxPreview = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <CheckboxComp id="checkbox-1" />
      <label htmlFor="checkbox-1">Default Checkbox</label>
    </div>
    <div className="flex items-center gap-3">
      <CheckboxComp id="checkbox-2" disabled />
      <label htmlFor="checkbox-2">Disabled Checkbox</label>
    </div>
    <label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
      <CheckboxComp
        id="checkbox-3"
        defaultChecked
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">Checkbox Block</p>
        <p className="text-muted-foreground text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
      </div>
    </label>
  </div>
);

const importCode = `
import { Checkbox } from "@repo/ui/components/checkbox";
`;

const usageCode = `
<div className="flex flex-col gap-3">
  <div className="flex items-center gap-3">
    <Checkbox id="checkbox-1" />
    <label htmlFor="checkbox-1">Default Checkbox</label>
  </div>
  <div className="flex items-center gap-3">
    <Checkbox id="checkbox-2" disabled />
    <label htmlFor="checkbox-2">Disabled Checkbox</label>
  </div>
  <label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
    <Checkbox
      id="checkbox-3"
      defaultChecked
      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
    />
    <div className="grid gap-1.5 font-normal">
      <p className="text-sm leading-none font-medium">Checkbox Block</p>
      <p className="text-muted-foreground text-sm">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
        quos.
      </p>
    </div>
  </label>
</div>
`;

const Checkbox = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Checkbox" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <CheckboxPreview />
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

export default Checkbox;
