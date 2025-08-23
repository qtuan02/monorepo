import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import { Switch as SwitchComp } from "@web/ui/shadcn-ui/switch";
import { Switch as SwitchAnimate } from "@web/ui/animate-ui/switch";
import { Label } from "@web/ui/shadcn-ui/label";

const SwitchPreview = () => (
  <div className="flex gap-2 flex-col">
    <div className="flex items-center space-x-2">
      <SwitchComp id="default-switch" />
      <Label htmlFor="default-switch">Default Switch</Label>
    </div>
    <div className="flex items-center space-x-2">
      <SwitchAnimate id="animation-switch" />
      <Label htmlFor="animation-switch">Animation Switch</Label>
    </div>
  </div>
);

const importCode = `
import { Switch } from "@web/ui/shadcn-ui/switch";
import { Switch as SwitchAnimate } from "@web/ui/animate-ui/switch";
`;

const usageCode = `
<div className="flex gap-2 flex-col">
  <div className="flex items-center space-x-2">
    <Switch id="default-switch" />
    <Label htmlFor="default-switch">Default Switch</Label>
  </div>
  <div className="flex items-center space-x-2">
    <Switch id="animation-switch" />
    <Label htmlFor="animation-switch">Animation Switch</Label>
  </div>
</div>
`;

const Switch = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Badge" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <SwitchPreview />
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

export default Switch;
