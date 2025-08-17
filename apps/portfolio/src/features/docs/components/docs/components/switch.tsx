import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Switch as SwitchComp } from "@repo/ui/components/switch";
import { Switch as SwitchAnimate } from "@repo/ui/animate-ui/switch";
import { Label } from "@repo/ui/components/label";

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
import { Switch } from "@repo/ui/components/switch";
import { Switch as SwitchAnimate } from "@repo/ui/animate-ui/switch";
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
      <SectionDocs title={t("preview")}>
        <SwitchPreview />
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

export default Switch;
