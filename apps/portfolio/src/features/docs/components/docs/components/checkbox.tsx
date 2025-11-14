import { getTranslations } from "next-intl/server";

import { Checkbox as CheckboxAnimate } from "@monorepo/ui/animate-ui/checkbox";
import { Checkbox as CheckboxComp } from "@monorepo/ui/shadcn-ui/checkbox";

import type { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

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
    <div className="flex items-center gap-3">
      <CheckboxAnimate id="checkbox-animation" />
      <label htmlFor="checkbox-animation">Animation Checkbox</label>
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
import { Checkbox } from "@monorepo/ui/shadcn-ui/checkbox";
import { Checkbox as CheckboxAnimate } from "@monorepo/ui/animate-ui/checkbox";
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
  <div className="flex items-center gap-3">
    <Checkbox id="checkbox-animation" />
    <label htmlFor="checkbox-animation">Animation Checkbox</label>
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
      <SectionPreview title={t("preview")}>
        <CheckboxPreview />
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

export default Checkbox;
