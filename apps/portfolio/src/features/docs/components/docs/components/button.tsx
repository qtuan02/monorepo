import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import { Button as ButtonComp } from "@repo/ui/components/button";
import { BatteryFull, Heart, Loader2Icon } from "lucide-react";

const ButtonPreview = () => (
  <div className="flex flex-wrap gap-3">
    <ButtonComp>Default</ButtonComp>
    <ButtonComp variant="secondary">Secondary</ButtonComp>
    <ButtonComp variant="destructive">Destructive</ButtonComp>
    <ButtonComp variant="outline">Outline</ButtonComp>
    <ButtonComp variant="ghost">Ghost</ButtonComp>
    <ButtonComp variant="link">Link</ButtonComp>
    <ButtonComp variant="secondary" size="icon">
      <BatteryFull />
    </ButtonComp>
    <ButtonComp variant="outline">
      <Heart /> With Icon
    </ButtonComp>
    <ButtonComp disabled>
      <Loader2Icon className="animate-spin" />
      Loading...
    </ButtonComp>
  </div>
);

const importCode = `
import { Button } from "@repo/ui/components/button";
`;

const usageCode = `
<div className="flex flex-wrap gap-3">
  <Button>Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
  <Button variant="secondary" size="icon">
    <BatteryFull />
  </Button>
  <Button variant="outline">
    <Heart /> With Icon
  </Button>
  <Button disabled>
    <Loader2Icon className="animate-spin" />
    Loading...
  </Button>
</div>
`;

const Button = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Button" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <ButtonPreview />
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

export default Button;
