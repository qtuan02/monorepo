import { Button as ButtonComp } from "@monorepo/ui/shadcn-ui/button";
import { BatteryFull, Heart, Loader2Icon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

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
import { Button } from "@monorepo/ui/shadcn-ui/button";
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
      <SectionPreview title={t("preview")}>
        <ButtonPreview />
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

export default Button;
